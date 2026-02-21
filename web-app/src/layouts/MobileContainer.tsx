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
    <div className={`min-h-screen ${backgroundColor} flex items-center justify-center `}>
      <div className="w-full max-w-[480px] bg-white h-screen md:h-[600px] md:shadow-2xl overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;
