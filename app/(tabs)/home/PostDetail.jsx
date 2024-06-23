import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Alert, Share, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';

export default function PostDetail() {
  const [product, setProduct] = useState({});
  const [allPosts, setAllPosts] = useState([]);
  const [multiPostIngredients, setMultiPostIngredients] = useState(new Set());
  const navigation = useNavigation();
  const { params } = useRoute();
  const user = getAuth().currentUser;
  const db = getFirestore(app);

  useEffect(() => {
    if (params) {
      setProduct(params.product);
    }
    fetchAllPosts();
  }, [params]);

  const fetchAllPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'UserPost'));
      const posts = querySnapshot.docs.map(doc => doc.data());
      console.log('Fetched posts:', posts); // Debugging log
      setAllPosts(posts);
      computeMultiPostIngredients(posts);
    } catch (error) {
      console.error('Error fetching all posts:', error);
    }
  };

  const computeMultiPostIngredients = (posts) => {
    const ingredientCount = {};
    posts.forEach(post => {
      post.ingredients?.forEach(ingredient => {
        const ingredientName = ingredient.name.trim().toLowerCase(); // Normalize ingredient name
        if (ingredientName) {
          if (ingredientCount[ingredientName]) {
            ingredientCount[ingredientName]++;
          } else {
            ingredientCount[ingredientName] = 1;
          }
        }
      });
    });

    const multiPostIngredientsSet = new Set();
    Object.keys(ingredientCount).forEach(ingredient => {
      if (ingredientCount[ingredient] > 1) {
        multiPostIngredientsSet.add(ingredient);
      }
    });

    console.log('Multi-post ingredients:', multiPostIngredientsSet); // Debugging log
    setMultiPostIngredients(multiPostIngredientsSet);
  };

  const handleIngredientPress = (ingredient) => {
    navigation.navigate('Search', { searchTerm: ingredient });
  };

  const shareProduct = async () => {
    const content = {
      message: product.title + "\n" + product.desc,
    };
    Share.share(content).then(resp => {
      console.log(resp);
    }, error => {
      console.log(error);
    });
  };

  const sendEmailMessage = () => {
    const subject = 'Regarding ' + product.title;
    const body = "Hi " + product.userName + "\n" + "I am interested in this product";
    Linking.openURL('mailto:' + product.userEmail + "?subject=" + subject + "&body=" + body);
  };

  const deleteUserPost = () => {
    Alert.alert('Do you want to delete this Post?', 'Are you Sure ?', [
      {
        text: 'Yes',
        onPress: () => deleteFromFirebase()
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      }
    ]);
  };

  const deleteFromFirebase = async () => {
    const q = query(collection(db, 'UserPost'), where('title', '==', product.title));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      deleteDoc(doc.ref).then(resp => {
        console.log("Deleted the Post..");
        navigation.goBack();
      });
    });
  };

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{product?.title}</Text>
            <Text style={styles.productCategory}>{product?.category}</Text>
            <Text style={styles.productDescription}>{product?.desc}</Text>
            <Text>Ingredients:</Text>
          </View>
        </View>
      )}
      data={product?.ingredients}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.ingredientContainer}>
          {multiPostIngredients.has(item.name.trim().toLowerCase()) ? (
            <TouchableOpacity onPress={() => handleIngredientPress(item.name)}>
              <Text style={styles.clickableIngredient}>{item.name}</Text>
            </TouchableOpacity>
          ) : (
            <Text>{item.name}</Text>
          )}
          <Text>{item.quantity}</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View>
          <View style={styles.userProfile}>
            <Text style={styles.userProfileTitle}>User Profile</Text>
            {product.userImage ? (
              <Image source={{ uri: product.userImage }} style={styles.userImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <Text style={styles.userName}>{product.userName}</Text>
            <Text style={styles.userEmail}>{product.userEmail}</Text>
          </View>

          {user?.email === product.userEmail ? (
            <TouchableOpacity
              onPress={deleteUserPost}
              style={[styles.button, styles.deleteButton]}
            >
              <Text style={styles.buttonText}> Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={sendEmailMessage}
              style={[styles.button, styles.messageButton]}
            >
              <Text style={styles.buttonText}> Send Message</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 320,
    marginBottom: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 320,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    color: '#757575',
  },
  productDetails: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#333',
  },
  ingredientContainer: {
    marginVertical: 8,
  },
  clickableIngredient: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  userProfile: {
    marginBottom: 20,
  },
  userProfileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  messageButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
