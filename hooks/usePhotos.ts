import { useQuery } from '@tanstack/react-query';
import { data } from '@/services/data-provider';

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: () => data.getPhotos(),
  });
}

export function usePhoto(id: string) {
  return useQuery({
    queryKey: ['photo', id],
    queryFn: () => data.getPhoto(id),
    enabled: !!id,
  });
}
