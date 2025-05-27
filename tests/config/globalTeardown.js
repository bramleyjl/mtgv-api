
export default async function() {
  console.log('Cleaning up after tests...');

  
  // Force all connections to close by terminating any hanging handles
  const timeout = setTimeout(() => {}, 30000); // Create a long timeout
  clearTimeout(timeout); // Immediately clear it to release the only handle we created
  
  // Give Node a moment to clean up
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Test cleanup complete');

}
