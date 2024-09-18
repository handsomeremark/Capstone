import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GlobalConnect from '../components/Global/GlobalConnect';
import Tooltip from '@mui/material/Tooltip';

// Define types for user and state
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  address: string;
}

const Customers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({ _id: '', firstName: '', lastName: '', gender: '', address: '' });

  // Fetch users 
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/profiles');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.gender || !newUser.address) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please fill in all the fields before adding a user.',
        customClass: {
          confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
        },
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const addedUser = await response.json();
        setUsers([...users, addedUser]);
        setNewUser({ _id: '', firstName: '', lastName: '', gender: '', address: '' });

        Swal.fire({
          icon: 'success',
          title: 'User Added',
          text: 'The user has been added successfully!',
          customClass: {
            confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
          },
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the user.',
        customClass: {
          confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
        },
      });
    }
  };

  const handleRemoveUser = async (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
        cancelButton: 'bg-swal-cancel text-white hover:bg-red-700',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5001/profiles/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setUsers(users.filter((user) => user._id !== id));

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The user has been deleted.',
              customClass: {
                confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
              },
            });
          }
        } catch (error) {
          console.error('Error removing user:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while deleting the user.',
            customClass: {
              confirmButton: 'bg-swal-confirm text-white hover:bg-blue-700',
            },
          });
        }
      }
    });
  };


  return (
    <div>
      <GlobalConnect pageName="Customers" />
      <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5">
        <h2 className="text-xl font-semibold dark:text-white mb-2">Add Customer</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Gender"
            value={newUser.gender}
            onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={handleAddUser}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Add Customer
          </button>
        </div>
      </div>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Customer List
          </h4>
        </div>

        <div className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5  dark:text-white">
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Full Name</p>
          </div>
          <div className="col-span-1 hidden items-center sm:flex">
            <p className="font-medium">Gender</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Address</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Actions</p>
          </div>
        </div>

        {users.map((user) => (
          <div
            className="grid grid-cols-5 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5"
            key={user._id}
          >
            <div className="col-span-2 flex items-center">
              <p className="text-sm text-black dark:text-white">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">
                {user.gender}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <Tooltip
                title={user.address}
                arrow
                placement="top"
                sx={{ maxWidth: 200 }}
              >
                <p className="text-sm text-black dark:text-white truncate">
                  {user.address}
                </p>
              </Tooltip>
            </div>
            <div className="col-span-1 flex items-center">
              <button
                onClick={() => handleRemoveUser(user._id)}
                className="bg-red-500 text-white px-4 py-1 rounded-md"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
