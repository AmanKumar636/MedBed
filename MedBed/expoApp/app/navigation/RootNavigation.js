import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootStack = createStackNavigator();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false
        }}
      >
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="App" component={AppStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
