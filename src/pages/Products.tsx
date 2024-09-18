import React from 'react';
import ProductManagement from '../components/Tables/ProductManagement'; 
import GlobalConnect from '../components/Global/GlobalConnect';

const Products: React.FC = () => {
  return (
    <>
      <GlobalConnect pageName="Products" />
      <ProductManagement /> 
    </>
  );
};

export default Products;
