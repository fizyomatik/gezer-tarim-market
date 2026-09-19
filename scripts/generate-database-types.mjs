import { writeFile } from 'node:fs/promises';
import { createTestDatabase } from './test-database.mjs';

const db = await createTestDatabase();
try {
  const { rows: columns } = await db.query(`select table_name,column_name,is_nullable,column_default,udt_name from information_schema.columns where table_schema='public' order by table_name,ordinal_position`);
  const { rows: enums } = await db.query(`select t.typname,e.enumlabel from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' order by t.typname,e.enumsortorder`);
  const { rows: relationships } = await db.query(`select c.conname,source.relname as source,target.relname as target,
    array(select a.attname from unnest(c.conkey) with ordinality k(num,ord) join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.num order by k.ord) as columns,
    array(select a.attname from unnest(c.confkey) with ordinality k(num,ord) join pg_attribute a on a.attrelid=c.confrelid and a.attnum=k.num order by k.ord) as target_columns
    from pg_constraint c join pg_class source on source.oid=c.conrelid join pg_class target on target.oid=c.confrelid
    join pg_namespace ns on ns.oid=source.relnamespace join pg_namespace nt on nt.oid=target.relnamespace
    where c.contype='f' and ns.nspname='public' and nt.nspname='public'`);
  const { rows: functions } = await db.query(`select p.proname,p.proargnames,p.proargmodes,
    array(select format_type(t,null) from unnest(coalesce(p.proallargtypes,p.proargtypes::oid[])) t) as types,
    format_type(p.prorettype,null) as result,p.proretset
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prorettype <> 'trigger'::regtype order by p.proname`);
  const enumNames = [...new Set(enums.map((item) => item.typname))];
  function type(name) {
    if (name.startsWith('_')) return `${type(name.slice(1))}[]`;
    if (name.endsWith('[]')) return `${type(name.slice(0, -2))}[]`;
    if (enumNames.includes(name)) return `Database['public']['Enums']['${name}']`;
    if (['bool','boolean'].includes(name)) return 'boolean';
    if (['int2','int4','int8','integer','smallint','bigint','numeric','float4','float8','real','double precision'].includes(name)) return 'number';
    if (name === 'void') return 'undefined';
    if (['json','jsonb'].includes(name)) return 'Json';
    return 'string';
  }
  let source = `// Generated from all migrations by npm run db:types. Do not edit by hand.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database = {\n  public: {\n    Tables: {\n`;
  for (const table of [...new Set(columns.map((item) => item.table_name))]) {
    source += `      ${table}: {\n`;
    for (const mode of ['Row','Insert','Update']) {
      source += `        ${mode}: {\n`;
      for (const col of columns.filter((item) => item.table_name === table)) {
        const optional = mode === 'Update' || (mode === 'Insert' && (col.column_default !== null || col.is_nullable === 'YES'));
        source += `          ${col.column_name}${optional ? '?' : ''}: ${type(col.udt_name)}${col.is_nullable === 'YES' ? ' | null' : ''};\n`;
      }
      source += '        };\n';
    }
    source += '        Relationships: [\n';
    for (const relation of relationships.filter((item) => item.source === table)) {
      source += `          { foreignKeyName: ${JSON.stringify(relation.conname)}; columns: ${JSON.stringify(relation.columns)}; isOneToOne: false; referencedRelation: ${JSON.stringify(relation.target)}; referencedColumns: ${JSON.stringify(relation.target_columns)} },\n`;
    }
    source += '        ];\n      };\n';
  }
  source += '    };\n    Views: { [_ in never]: never };\n    Functions: {\n';
  for (const fn of functions) {
    const fields = (fn.proargnames ?? []).map((name,index) => ({ name,type:type(fn.types[index]),mode:fn.proargmodes?.[index] ?? 'i' }));
    const args = fields.filter((item) => item.mode === 'i');
    const output = fields.filter((item) => item.mode === 't');
    const result = output.length ? `{ ${output.map((item) => `${item.name}: ${item.type}`).join('; ')} }[]` : type(fn.result) + (fn.proretset ? '[]' : '');
    source += `      ${fn.proname}: { Args: ${args.length ? '{ '+ args.map((item) => `${item.name}: ${item.type} | null`).join('; ')+' }' : 'Record<PropertyKey, never>'}; Returns: ${result} };\n`;
  }
  source += '    };\n    Enums: {\n';
  for (const name of enumNames) source += `      ${name}: ${enums.filter((item) => item.typname===name).map((item) => JSON.stringify(item.enumlabel)).join(' | ')};\n`;
  source += '    };\n    CompositeTypes: { [_ in never]: never };\n  };\n};\n';
  await writeFile(new URL('../src/lib/supabase/database.types.ts',import.meta.url), source);
  console.log('Generated database.types.ts from the migrated PostgreSQL schema.');
} finally { await db.close(); }
