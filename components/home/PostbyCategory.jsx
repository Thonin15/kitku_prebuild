import React from 'react';
import { View, FlatList } from 'react-native';
import PostItem from './PostItem';

const PostbyCategory = ({ latestItemList }) => {
    return (
        <View style={{ marginTop: 10 }}>
            <FlatList
                data={latestItemList}
                numColumns={2}
                renderItem={({ item }) => <PostItem item={item} />}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

export default PostbyCategory;
