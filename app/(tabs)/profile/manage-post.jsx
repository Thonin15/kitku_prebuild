import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function MyProducts() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [productList, setProductList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Fetch user posts when the component mounts or when the user changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (auth.currentUser) {
        getUserPost();
      }
    });
    return unsubscribe;
  }, [navigation, auth.currentUser]);

  // Function to fetch user posts
  const getUserPost = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        if (userEmail) {
          const q = query(collection(db, 'UserPost'), where('userEmail', '==', userEmail));
          const snapshot = await getDocs(q);
          const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProductList(posts);
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // Refresh control handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserPost().finally(() => setRefreshing(false));
  }, []);

  // Render each item in the FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('product-detail', {
          product: item
        })
      }
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      <Text style={styles.productTitle}>{item.title}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  // Render header for the FlatList
  const renderHeader = () => (
    <Text style={styles.header}>My Products</Text>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={productList}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
  noImageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  noImageText: {
    color: '#757575',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  productCategory: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
    textAlign: 'center',
  },
});
