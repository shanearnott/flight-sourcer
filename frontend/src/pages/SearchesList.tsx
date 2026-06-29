import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { searchesApi } from '../api/client';
import SearchCard from '../components/search/SearchCard';
import { Button, EmptyState, Spinner } from '../components/ui';

export default function SearchesList() {
  const { data: searches, isLoading } = useQuery({
    queryKey: ['searches'],
    queryFn: () => searchesApi.list(),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Searches</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your flight monitoring configurations</p>
        </div>
        <Link to="/searches/new">
          <Button><Plus className="w-4 h-4" />New Search</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !searches?.length ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="No searches yet"
          description="Create your first search to start tracking flight prices."
          action={<Link to="/searches/new"><Button><Plus className="w-4 h-4" />Create Search</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {searches.map(search => (
            <SearchCard key={search.id} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}
