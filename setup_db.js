const { Client } = require('pg');
const fs = require('fs');

async function runSchema() {
  const connectionString = 'postgresql://postgres:[TACOSALAJEDREZ]@db.jqbgssvbpliqkzivejsj.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    const schemaSql = fs.readFileSync('schema.sql', 'utf8');
    await client.query(schemaSql);
    console.log('Schema executed successfully!');
    
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

runSchema();
