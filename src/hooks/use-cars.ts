import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCars, getAvailableCars, createCar, updateCar, deleteCar, type Car, type CarInsert, type CarUpdate } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

export const CARS_QUERY_KEY = 'cars';
export const AVAILABLE_CARS_QUERY_KEY = 'available_cars';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}

export function useCars() {
  return useQuery({
    queryKey: [CARS_QUERY_KEY],
    queryFn: getCars,
  });
}

export function useAvailableCars() {
  return useQuery({
    queryKey: [AVAILABLE_CARS_QUERY_KEY],
    queryFn: getAvailableCars,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (car: CarInsert) => createCar(car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABLE_CARS_QUERY_KEY] });
      toast({ title: t.admin.toasts.carCreated, description: t.admin.toasts.carCreatedDesc });
    },
    onError: (error: unknown) => {
      toast({ title: t.admin.toasts.errorCreate, description: errorMessage(error), variant: 'destructive' });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ id, car }: { id: string; car: CarUpdate }) => updateCar(id, car),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABLE_CARS_QUERY_KEY] });
      toast({ title: t.admin.toasts.carUpdated, description: t.admin.toasts.carUpdatedDesc });
    },
    onError: (error: unknown) => {
      toast({ title: t.admin.toasts.errorUpdate, description: errorMessage(error), variant: 'destructive' });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABLE_CARS_QUERY_KEY] });
      toast({ title: t.admin.toasts.carDeleted, description: t.admin.toasts.carDeletedDesc });
    },
    onError: (error: unknown) => {
      toast({ title: t.admin.toasts.errorDelete, description: errorMessage(error), variant: 'destructive' });
    },
  });
}
