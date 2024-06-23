import {
	SafeAreaView,
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/useAuthStore';

export default function BecomeSellerScreen() {
	const { updateUserInfo, userInfo } = useAuthStore((state) => state);
	const [loading, setLoading] = useState(false);
	const [isSeller, setIsSeller] = useState(false);
	const db = getFirestore();
	const auth = getAuth();
	const user = auth.currentUser;
	const router = useRouter();

	useEffect(() => {
		const checkUserRole = async () => {
			if (user) {
				const userDocRef = doc(db, 'users', user.uid);
				const userDoc = await getDoc(userDocRef);
				if (userDoc.exists()) {
					const userData = userDoc.data();
					setIsSeller(userData.role === 'seller');
				}
			}
		};

		checkUserRole();
	}, [user, db]);

	const validationSchema = Yup.object().shape({
		storeName: Yup.string().required('Store name is required'),
	});

	const onSubmit = async (values, { resetForm }) => {
		setLoading(true);
		try {
			// Update user's role to 'seller' in the 'users' collection
			const userDocRef = doc(db, 'users', user.uid);
			updateUserInfo({ storeName: values.storeName });
			await updateDoc(userDocRef, {
				...userInfo,
				storeName: values.storeName,
			});
			Alert.alert('Success', 'You are now a seller!', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);

			resetForm();
		} catch (error) {
			console.error('Error updating user: ', error);
			Alert.alert('Error', 'There was an error. Please try again.');
		}
		setLoading(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			{isSeller ? (
				<View style={styles.messageContainer}>
					<Text style={styles.messageText}>
						You are already a seller!
					</Text>
					<Button
						title='Go to Marketplace'
						onPress={() => router.back()}
					/>
				</View>
			) : (
				<Formik
					initialValues={{ storeName: '', location: '' }}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
				>
					{({
						handleChange,
						handleBlur,
						handleSubmit,
						values,
						errors,
					}) => (
						<View style={styles.form}>
							<TextInput
								style={styles.input}
								placeholder='Store Name'
								onChangeText={handleChange('storeName')}
								onBlur={handleBlur('storeName')}
								value={values.storeName}
							/>
							{errors.storeName && (
								<Text style={styles.errorText}>
									{errors.storeName}
								</Text>
							)}

							<Button
								title='Go to Marketplace'
								onPress={() =>
									router.push('/upload/map-location')
								}
							/>
							{errors.location && (
								<Text style={styles.errorText}>
									{errors.location}
								</Text>
							)}

							<Button
								onPress={handleSubmit}
								title='Submit'
								disabled={loading}
							/>
							{loading && (
								<ActivityIndicator
									size='large'
									color='#0000ff'
								/>
							)}
						</View>
					)}
				</Formik>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	form: {
		flex: 1,
		justifyContent: 'center',
	},
	input: {
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginVertical: 5,
	},
	errorText: {
		color: 'red',
		marginBottom: 10,
	},
	messageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	messageText: {
		fontSize: 18,
		marginBottom: 20,
	},
});
