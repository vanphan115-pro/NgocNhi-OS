import React from 'react';
import { FarmArea, FarmRow, FarmCage } from './farmTypes';
import { UniversalQRModal } from './UniversalQRModal';

interface FarmQRModalProps {
  onClose: () => void;
  allAreas?: FarmArea[];
  allRows?: FarmRow[];
}

export const FarmQRModal: React.FC<FarmQRModalProps> = ({ 
  onClose,
  allAreas = [],
  allRows = []
}) => {
  return (
    <UniversalQRModal
      initialType="system"
      allAreas={allAreas}
      allRows={allRows}
      onClose={onClose}
    />
  );
};

interface CageQRModalProps {
  cage?: FarmCage | null;
  area?: FarmArea | null;
  row?: FarmRow | null;
  allAreas?: FarmArea[];
  allRows?: FarmRow[];
  onClose: () => void;
}

export const CageQRModal: React.FC<CageQRModalProps> = ({ 
  cage, 
  area, 
  row,
  allAreas = [],
  allRows = [],
  onClose 
}) => {
  const initialType = cage ? 'cage' : row ? 'row' : area ? 'area' : 'system';

  return (
    <UniversalQRModal
      initialType={initialType}
      cage={cage}
      area={area}
      row={row}
      allAreas={allAreas}
      allRows={allRows}
      onClose={onClose}
    />
  );
};
