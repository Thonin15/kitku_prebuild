import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

const UserCard = ({ userData, userPosts, onClose }) => {
  return (
    <View style={styles.card}>
      {/* Close button to close the user card */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      {/* User's display name */}
      <Text style={styles.title}>{userData.displayName}</Text>
      {/* User's email */}
      <Text style={styles.detail}>Email: {userData.email}</Text>
      {/* User's store name */}
      <Text style={styles.detail}>Store Name: {userData.storeName}</Text>
      {/* Title for the user's posts */}
      <Text style={styles.postsTitle}>User Posts:</Text>
      
      <ScrollView style={styles.postsContainer}>
        {/* Mapping through user posts */}
        {userPosts.map((post, index) => (
          <View key={index} style={styles.postContainer}>
            {/* Post title */}
            <Text style={styles.postTitle}>{index + 1}. {post.title}</Text>
            {/* Post image */}
            <Image
              source={{ uri: post.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'relative',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#f00',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  postsContainer: {
    maxHeight: 200, // Limit the height of the posts section to prevent overflow
    marginTop: 10,
  },
  postContainer: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    marginVertical: 2,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 150, // Set a fixed height for images
    borderRadius: 10,
    marginTop: 5,
  },
});

export default UserCard;
