'use client'
import { useState, useEffect } from "react";
import { firestore, auth } from '@/firebase'; // Adjust the import path as necessary
import { Box, Modal, Button, Typography, Stack, TextField, Select, MenuItem, AppBar, Toolbar,Alert } from '@mui/material';
import { getDocs, query, collection, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const updateInventory = async () => {
    if (user) {
      const userId = user.uid;
      const snapshot = query(collection(firestore, 'inventory', userId, 'items'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    }
  };
  


  const addItem = async (item, category) => {
    if (item && user) {
      const userId = user.uid;
      const docRef = doc(firestore, 'inventory', userId, 'items', item.toLowerCase()); // Use a subcollection for each user
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: 1, category });
      }
      await updateInventory(); // Ensure this function uses the current user
    }
  };

  
  const removeItem = async (item) => {
    if (user) {
      const userId = user.uid;
      const docRef = doc(firestore, 'inventory', userId, 'items', item);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
        }
      }
      await updateInventory(); // Ensure this function uses the current user
    }
  };
  

  const filteredInventory = inventory.filter(item =>
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        updateInventory(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCategoryModalOpen = () => setCategoryModalOpen(true);
  const handleCategoryModalClose = () => setCategoryModalOpen(false);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory.toLowerCase())) {
      setCategories([...categories, newCategory.toLowerCase()]);
      setNewCategory('');
      handleCategoryModalClose();
    }
  };

  const handleSignUp = async () => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setUser(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignIn = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);  // Set user directly from the result
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Sign in error:', err.message);  // Log error for debugging
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err.message);
    }
  };


  if (!user) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={2}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Inventory Management
            </Typography>
          </Toolbar>
        </AppBar>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h5">{isLogin ? "Login" : "Sign Up"}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            variant="outlined"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
          />
          <TextField
            variant="outlined"
            size="small"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
          />
          <Button variant="contained" onClick={isLogin ? handleSignIn : handleSignUp}>
            {isLogin ? "Login" : "Sign Up"}
          </Button>
          <Button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create an account" : "Already have an account? Login"}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      flexDirection="column"
      gap={2}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Management
          </Typography>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            {user.email}
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              label="Item Name"
            />
            <Select
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, category);
                setItemName('');
                setCategory('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
          <Button onClick={handleCategoryModalOpen}>Add Category</Button>
        </Box>
      </Modal>
      <Modal open={categoryModalOpen} onClose={handleCategoryModalClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add New Category</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            label="Category Name"
          />
          <Button onClick={handleAddCategory}>Add Category</Button>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={handleOpen}
      >
        Add Item
      </Button>
      <TextField
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        label="Search"
      />

      <Select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
      >
        <MenuItem value="all">
          <em>All</em>
        </MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
        ))}
      </Select>

      <Box border={'1px solid #333'}>
      <Box
        width="800px"
        height="100px"
        bgcolor={'#ADD8E6'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
          Inventory Items
        </Typography>
      </Box>
        <Stack width="100%" height="300px" overflow="auto" spacing={2}>
        {filteredInventory.map(({ id, name, quantity, category }) => (
          <Box 
            key={id}  // Unique key prop
            width="100%"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            paddingX={5}
          >
            <Typography variant='h3' color='#333' textAlign="center">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant='h3' color='#333' textAlign="center">
              {quantity}
            </Typography>
            <Typography variant='h5' color='#333' textAlign="center">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                onClick={() => addItem(name, category)}
              >
                Add
              </Button>
              <Button 
                variant="contained" 
                onClick={() => removeItem(name)}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
        </Stack>
      </Box>
    </Box>
  );
}
