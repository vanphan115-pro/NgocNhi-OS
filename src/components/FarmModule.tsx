import React from 'react';
import { UserRole, DuiProductOrder, DuiOrderStatus } from '../types';
import { FarmIntegratedApp } from './farm/FarmIntegratedApp';

interface FarmModuleProps {
  onBackToPortal?: () => void;
  userRole: UserRole;
  duiOrders: DuiProductOrder[];
  onAddDuiOrder: (orderData: Omit<DuiProductOrder, 'id' | 'code' | 'createdAt' | 'status'>) => DuiProductOrder;
  onUpdateDuiOrderStatus?: (orderId: string, status: DuiOrderStatus) => void;
  onOpenAdminLogin?: (reason?: string) => void;
}

export const FarmModule: React.FC<FarmModuleProps> = ({ 
  onBackToPortal,
  userRole,
  duiOrders,
  onAddDuiOrder,
  onUpdateDuiOrderStatus,
  onOpenAdminLogin
}) => {
  return (
    <FarmIntegratedApp 
      onBackToPortal={onBackToPortal} 
      userRole={userRole}
      duiOrders={duiOrders}
      onAddDuiOrder={onAddDuiOrder}
      onUpdateDuiOrderStatus={onUpdateDuiOrderStatus}
      onOpenAdminLogin={onOpenAdminLogin}
    />
  );
};

