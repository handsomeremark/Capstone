import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Tooltip from '@mui/material/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    image?: string;
    category: string;
}

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

// Modal Component: Renders a modal with a close button and content passed as children
const Modal: React.FC<ModalProps> = React.memo(({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded shadow-lg max-w-lg w-full">
                <div className="p-4 border-b">
                    <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                    <h2 className="text-2xl font-semibold text-black">Edit Product</h2>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
});

const ProductManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedPrice, setEditedPrice] = useState<number | ''>('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedCategory, setEditedCategory] = useState('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [category, setCategory] = useState<string>('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Fetch products from the server when the component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get<Product[]>('http://localhost:5001/products');
                setProducts(response.data);
                setFilteredProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error fetching products.',
                });
            }
        };
        fetchProducts();
    }, []);
    // Set editing product details when "Edit" button is clicked
    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditedName(product.name);
        setEditedPrice(product.price);
        setEditedDescription(product.description);
        setEditedCategory(product.category);
    };

    // Save edited product details
    const handleSaveClick = async () => {
        const integerPrice = editedPrice === '' ? '' : Number(editedPrice);
        if (integerPrice !== '' && (isNaN(integerPrice) || integerPrice < 0)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Price',
                text: 'Please enter a valid non-negative integer for the price.',
            });
            return;
        }
        if (editingProduct) {
            try {
                const response = await axios.put(`http://localhost:5001/products/${editingProduct._id}`, {
                    name: editedName,
                    price: integerPrice,
                    description: editedDescription,
                    category: editedCategory,
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product updated successfully!',
                    confirmButtonText: 'OK',
                });
                setProducts(products.map((p) => (p._id === editingProduct._id ? response.data : p)));
                setEditingProduct(null);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error updating product.',
                });
            }
        }
    };

    // Handle file input change for product image preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setImage(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImagePreview(reader.result);
                } else {
                    setImagePreview(null);
                }
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Submit form to add a new product
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', typeof price === 'number' ? price.toString() : '');
        formData.append('description', description);
        formData.append('category', category);
        if (image) formData.append('image', image);

        try {
            console.log('Submitting form data:', formData);
            const response = await axios.post<Product>('http://localhost:5001/add-product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Product added successfully:', response.data);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Product added successfully!',
                confirmButtonText: 'OK',
            });

            setProducts([...products, response.data]);
            setProductName('');
            setPrice('');
            setDescription('');
            setCategory('');
            setImage(null);
        } catch (error) {
            console.error('Error adding product:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error adding product.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle product deletion with confirmation
    const handleDeleteClick = async (id: string) => {
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });
        if (!confirmDelete.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5001/products/${id}`);
            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Product deleted successfully!',
                confirmButtonText: 'OK',
            });
            setProducts(products.filter((product) => product._id !== id));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error deleting product.',
            });
        }
    };

    // Filter products based on search query and selected category
    useEffect(() => {
        let updatedProducts = products;
        if (searchQuery) {
            updatedProducts = updatedProducts.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCategory) {
            updatedProducts = updatedProducts.filter(
                (product) => product.category === selectedCategory
            );
        }
        setFilteredProducts(updatedProducts);
    }, [searchQuery, selectedCategory, products]);

    return (
        <div className="p-2">
            {/* Add Product Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-4 border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:bg-boxdark sm:px-2 xl:pb-2">
                <h2 className="mb-6 text-xl font-semibold text-black dark:text-white">Add New Product</h2>
                <div className="flex flex-col gap-4 mb-6">
                    {/* Row 1: Product Name and Price */}
                    <div className="flex gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-lg font-medium mb-2 dark:text-white">Product Name</label>
                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required
                                placeholder='Enter product name'
                                className="border border-gray-300 p-2 text-black w-full rounded" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-lg font-medium mb-2 dark:text-white">Price</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required
                                placeholder='Enter product price'
                                className="border border-gray-300 p-2 text-black w-full rounded" />
                        </div>
                    </div>

                    {/* Row 2: Description and Category */}
                    <div className="flex gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-lg font-medium mb-2 dark:text-white">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                                placeholder="Enter product description"
                                className="border border-gray-300 p-2 text-black w-full rounded resize-none overflow-hidden" draggable="false" onDragStart={(e) => e.preventDefault()} />
                        </div>
                        <div className="flex-1 min-w-[200px]"> <label className="block text-lg font-medium mb-2 dark:text-white">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}
                                className="border border-gray-300 p-2 text-black w-full rounded">
                                <option value=""></option>
                                <option value="Fruits">Fruits</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Spices">Spices</option>

                            </select>
                        </div>
                    </div>
                    {/* Row 3: Image Upload */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-lg font-medium mb-2 dark:text-white">Product Image</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="border border-gray-300 p-2 text-black w-full rounded dark:text-white" />
                        </div>
                        {imagePreview && (
                            <div className="flex-1 min-w-[200px]">
                                <img src={imagePreview} alt="Product Preview" className="w-32 h-32 object-cover rounded border border-gray-300" />
                            </div>
                        )}
                    </div>
                </div>
                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 transition duration-150 ease-in-out"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </form>
            {/* Product List */}
            <div className="overflow-x-auto">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-2 xl:pb-2">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        Product List
                    </h4>
                    {/* Search Bar and Category Dropdown */}
                    <div className="flex items-start justify-start mb-4">
                        <div className="mr-4">
                            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[300px] p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-[300px] p-2 border border-gray-300 rounded"

                            >
                                <option value="">All Categories</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Spices">Spices</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="grid grid-cols-6 gap-5 rounded-sm bg-gray-200 dark:bg-meta-4 sm:grid-cols-6">
                            {/* Table Header */}
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Product Image</h5>
                            </div>
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Product Name</h5>
                            </div>
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Price</h5>
                            </div>
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Description</h5>
                            </div>
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Category</h5>
                            </div>
                            <div className="p-2.5 xl:p-5">
                                <h5 className="text-sm font-medium uppercase xsm:text-base dark:text-white">Actions</h5>
                            </div>
                        </div>
                        {/* Table Body */}
                        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="grid grid-cols-6 gap-4 border-t border-stroke dark:border-strokedark items-center">
                                    <div className="p-2.5 xl:p-5 flex items-start justify-start">
                                        {product.image && (
                                            <img
                                                src={`data:image/png;base64,${product.image}`}
                                                alt={product.name}
                                                className="w-20 h-20 object-cover rounded-lg shadow-md"
                                            />
                                        )}
                                    </div>
                                    <div className="p-2.5 xl:p-7 text-left truncate dark:text-white">
                                        <Tooltip
                                            title={product.name}
                                            arrow
                                            placement="top"
                                            sx={{ maxWidth: 200 }}
                                        >
                                            <div className="text-base">{product.name}</div>
                                        </Tooltip>
                                    </div>
                                    <div className="p-2.5 xl:p-7 text-left dark:text-white">
                                        <span className="text-base text-gray-500 dark:text-gray-300">
                                            {typeof product.price === 'number' ? `₱${product.price.toFixed(2)}` : '₱0.00'}
                                        </span>
                                    </div>
                                    <div className="p-2.5 xl:p-7 text-left truncate dark:text-white">
                                        <Tooltip
                                            title={product.description}
                                            arrow
                                            placement="top"
                                            sx={{ maxWidth: 100 }}
                                        >
                                            <div className="text-base truncate">{product.description}</div>
                                        </Tooltip>
                                    </div>
                                    <div className="p-2.5 xl:p-8 text-left dark:text-white">
                                        <span className="text-base text-gray-500 dark:text-gray-300">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="xl:p-2 flex justify-start items-start space-x-2">
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition-colors text-base flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors text-base flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <Modal onClose={() => setEditingProduct(null)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-lg font-medium mb-1 dark:text-black">Product Name</label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded dark:text-black" 
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1 dark:text-black">Price</label>
                            <input
                                type="number"
                                value={editedPrice}
                                onChange={(e) => setEditedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="border border-gray-300 p-2 w-full rounded dark:text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1 dark:text-black">Category</label>
                            <select
                                value={editedCategory}
                                onChange={(e) => setEditedCategory(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded dark:text-black"
                            >
                                <option value="Fruits">Fruits</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Spices">Spices</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-lg font-medium mb-1 dark:text-black">Description</label>
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                rows={3}
                                className="border border-gray-300 p-2 w-full rounded dark:text-black "
                            />
                        </div>
                        <button
                            onClick={handleSaveClick}
                            className="py-2 px-4 rounded bg-blue-500 text-white"
                        >
                            Save
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
export default ProductManagement;

