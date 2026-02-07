import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  backgroundColor = 'bg-gray-100',
}) => {
  return (
    <div className={`min-h-screen ${backgroundColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-[480px] bg-white min-h-screen md:min-h-0 md:shadow-2xl overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;
