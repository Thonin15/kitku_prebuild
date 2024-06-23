import { Stack } from 'expo-router';

export default function UploadLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen name='index' options={{ title: 'Create Post'}} />
			<Stack.Screen
				name='seller-form'
				options={{ title: 'Become a Seller in KitKu App' }}
			/>
			<Stack.Screen name='map-location' options={{ title: 'Map' }} />
			<Stack.Screen name='edit-processing-post' options={{ title: 'Edit Post' }} />
		</Stack>
	);
}
