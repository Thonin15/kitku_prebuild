import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../../firebaseConfig';

import PostbyCategory from '@/components/home/PostbyCategory';

export default function ItemList() {
    const { params } = useRoute();
    const db = getFirestore(app);
    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (params?.category) {
            getItemListByCategory();
        }
    }, [params]);

    const getItemListByCategory = async () => {
        try {
            setLoading(true);
            setItemList([]);
            const q = query(collection(db, 'UserPost'), where('category', '==', params.category));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => doc.data());
            setItemList(items);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoading(false);
        }
    };

    return (
        <View>
            {loading ?
                <ActivityIndicator size='large' />
                :
                itemList?.length > 0 ?
                    <PostbyCategory latestItemList={itemList} />
                    :
                    <Text className="p-5">No Post Found</Text>
            }
        </View>
    );
}
