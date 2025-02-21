import { LogBox } from 'react-native';
import 'expo-router/entry';

// Configure global logging parameters
LogBox.ignoreLogs([
  'Remote debugger',
  'Require cycle:', 
  'Non-serializable values'
]);

// Optional: Add global error handler
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('[GLOBAL_ERROR]', { error, isFatal });
});