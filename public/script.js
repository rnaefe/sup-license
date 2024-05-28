document.addEventListener('DOMContentLoaded', async () => {
    var apiKey = 'helomadafa-5A89E6';
    const createProductForm = document.getElementById('create-product-form');
    const createUserForm = document.getElementById('create-user-form');
    const createActivationForm = document.getElementById('create-activation-form');
    const loadProductsButton = document.getElementById('load-products');
    const loadUsersButton = document.getElementById('load-users');
    const loadActivationCodesButton = document.getElementById('load-activation-codes');

    const apikeyinput = document.getElementById('apikey');
    const apikeybutton = document.getElementById('apikeyregister');

    // Function to load products
    const loadProducts = async () => {
        try {
            const response = await fetch('/products/getall', {
                method: 'GET',
                headers: {
                    'api-key': apiKey
                }
            });

            const products = await response.json();
            console.log(products)
            const productList = document.getElementById('product-list');
            productList.innerHTML = '';

            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.textContent = `ID: ${product.uuid}, Name: ${product.name}`;
                productList.appendChild(productItem);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    try {
                        await fetch(`/products/delete/${product.uuid}`, {
                            method: 'DELETE',
                            headers: {
                                'api-key': apiKey
                            }
                        });
                        productItem.remove();
                    } catch (error) {
                        console.error('Error deleting product:', error);
                    }
                });

                productItem.appendChild(deleteButton);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    // Function to load users
    const loadUsers = async () => {
        try {
            const response = await fetch('/users/getall', {
                method: 'GET',
                headers: {
                    'api-key': apiKey
                }
            });

            const users = await response.json();
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.textContent = `ID: ${user.id}, Name: ${user.username}, Email: ${user.email}`;
                userList.appendChild(userItem);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    try {
                        await fetch(`/users/delete/${user.id}`, {
                            method: 'DELETE',
                            headers: {
                                'api-key': apiKey
                            }
                        });
                        userItem.remove();
                    } catch (error) {
                        console.error('Error deleting user:', error);
                    }
                });

                userItem.appendChild(deleteButton);
            });
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    // Function to load activation codes
    const loadActivationCodes = async () => {
        try {
            const response = await fetch('/activation/getall', {
                method: 'GET',
                headers: {
                    'api-key': apiKey
                }
            });

            const activationCodes = await response.json();
            console.log(activationCodes)
            const activationCodeList = document.getElementById('activation-code-list');
            activationCodeList.innerHTML = '';

            activationCodes.forEach(code => {
                const codeItem = document.createElement('div');
                codeItem.textContent = `Code: ${code.activation_code}, Product ID: ${code.product_id}`;
                activationCodeList.appendChild(codeItem);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    try {
                        await fetch(`/activation/delete/${code.activation_code}`, {
                            method: 'DELETE',
                            headers: {
                                'api-key': apiKey
                            }
                        });
                        codeItem.remove();
                    } catch (error) {
                        console.error('Error deleting activation code:', error);
                    }
                });

                codeItem.appendChild(deleteButton);
            });
        } catch (error) {
            console.error('Error loading activation codes:', error);
        }
    };

    // Load data when DOM is loaded
    await loadProducts();
    await loadUsers();
    await loadActivationCodes();

    // Update data on button click
    loadProductsButton.addEventListener('click', loadProducts);
    loadUsersButton.addEventListener('click', loadUsers);
    loadActivationCodesButton.addEventListener('click', loadActivationCodes);

    apikeybutton.addEventListener('click', async (e) => {
        e.preventDefault();
        const apikeyname = apikeyinput.value;
        alert(apikeyname)
        apikey = apikeyname
    });

    createProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productName = document.getElementById('productName').value;
        const allowedIps = document.getElementById('allowedIps').value.split(',');
        const blacklistedIps = document.getElementById('blacklistedIps').value.split(',');

        try {
            const response = await fetch('/products/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({ name: productName, allowed_ips: allowedIps, blacklisted_ips: blacklistedIps })
            });

            const result = await response.json();
            document.getElementById('create-product-message').textContent = result.message;
            await loadProducts();
        } catch (error) {
            document.getElementById('create-product-message').textContent = 'Error creating product';
        }
    });

    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPassword = document.getElementById('userPassword').value;

        try {
            const response = await fetch('/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({ username: userName, email: userEmail, password: userPassword })
            });

            const result = await response.json();
            document.getElementById('create-user-message').textContent = result.message;
            await loadUsers();
        } catch (error) {
            document.getElementById('create-user-message').textContent = 'Error creating user';
        }
    });

    createActivationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('productId').value;

        try {
            const response = await fetch('/activation/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({ product_id: productId })
            });

            const result = await response.json();
            document.getElementById('create-activation-message').textContent = result.message;
            await loadActivationCodes();
        } catch (error) {
            document.getElementById('create-activation-message').textContent = 'Error creating activation code';
        }
    });
});
