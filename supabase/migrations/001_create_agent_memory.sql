-- Enable pgvector extension
create extension if not exists vector;

-- Create agent_memory table
create table if not exists agent_memory (
  id          bigserial primary key,
  input       text        not null,
  output      text        not null,
  embedding   vector(1536),
  timestamp   timestamptz not null default now()
);

-- Index for fast similarity search
create index if not exists agent_memory_embedding_idx
  on agent_memory
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Similarity search function
create or replace function match_memories(
  query_embedding vector(1536),
  match_count     int default 5
)
returns table (
  id        bigint,
  input     text,
  output    text,
  timestamp timestamptz,
  similarity float
)
language sql stable as $$
  select
    id, input, output, timestamp,
    1 - (embedding <=> query_embedding) as similarity
  from agent_memory
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
