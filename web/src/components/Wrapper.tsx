import React from 'react';
import { Box } from '@chakra-ui/react';

interface WrapperProps {
  variant?: 'regular' | 'small';
}

export const Wrapper: React.FC<WrapperProps> = ({
  variant = 'regular',
  children
}) => {
  return (
    <Box
      maxW={variant === 'regular' ? '800px' : '400px'}
      mt={8}
      mx="auto"
      w="100%"
    >
      {children}
    </Box>
  );
};
