import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useContributions = (goalId) => {
  return useQuery({
    queryKey: ['contributions', goalId],
    queryFn: async () => {
      const response = await api.get(`/goals/${goalId}/contributions`);
      return response.data;
    },
    enabled: !!goalId,
  });
};

export const useCreateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ goalId, ...contributionData }) => {
      const response = await api.post(`/goals/${goalId}/contributions`, contributionData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contributions', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.goalId, 'projection'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, goalId, ...contributionData }) => {
      const response = await api.put(`/contributions/${id}`, contributionData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contributions', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.goalId, 'projection'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useDeleteContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, goalId }) => {
      await api.delete(`/contributions/${id}`);
      return { id, goalId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contributions', data.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', data.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals', data.goalId, 'projection'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};