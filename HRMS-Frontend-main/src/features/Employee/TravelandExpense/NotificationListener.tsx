import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../auth/api/axios';
import useAuth from '../../auth/hooks/useAuth';

type Props = {}

const NotificationListener = (props: Props) => {
     const { role, accessToken } = useAuth(); 

    useQuery({
        queryKey: ['inAppNotifications'],
        queryFn: async () => {
            const response = await api.get('/EmployeePlan/unread');
            const notifications = response.data;

            if (notifications && notifications.length > 0) {
                notifications.forEach((n: any) => {
                    console.log("Notification Data:", n);
                    toast.info(n.message, {
                        description: `Assigned on ${new Date(n.CreatedAt).toLocaleDateString()}`,
                    });
                });
            }
            return notifications;
        },
        enabled: !!accessToken && role === 'Employee',
        refetchInterval: 1000 * 60 * 60 * 4,
        refetchIntervalInBackground: true,
    });
    return null;
}
export default NotificationListener;