const axios = require('axios');

// Test script for BGMI player search API
async function testBgmiSearch() {
    console.log('Testing BGMI Player Search API...\n');
    
    const baseUrl = 'http://localhost:8080/api';
    
    try {
        // First, try to register a test user
        console.log('1. Registering test user...');
        try {
            const registerResponse = await axios.post(`${baseUrl}/auth/register`, {
                username: 'bgmitest' + Date.now(),
                email: `bgmitest${Date.now()}@example.com`,
                password: 'Test123!@#'
            });
            console.log('✓ User registered successfully');
        } catch (error) {
            console.log('✗ Registration failed:', error.response?.data || error.message);
        }
        
        // Try to login
        console.log('\n2. Logging in...');
        let token = null;
        try {
            const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
                usernameOrEmail: 'admin',
                password: 'admin123'
            });
            token = loginResponse.data.accessToken;
            console.log('✓ Login successful, token received');
        } catch (error) {
            console.log('✗ Login failed:', error.response?.data || error.message);
            console.log('Trying with default credentials...');
            
            // Try with another set of credentials
            try {
                const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
                    usernameOrEmail: 'test@example.com',
                    password: 'password123'
                });
                token = loginResponse.data.accessToken;
                console.log('✓ Login successful with alternate credentials');
            } catch (error) {
                console.log('✗ Login failed with alternate credentials too');
            }
        }
        
        // Test BGMI search without authentication (should fail)
        console.log('\n3. Testing BGMI search without authentication...');
        try {
            const searchResponse = await axios.get(`${baseUrl}/game-stats/bgmi/search`, {
                params: { playerName: 'JONATHAN' }
            });
            console.log('✓ Search successful without auth (public endpoint)');
            console.log('Response:', JSON.stringify(searchResponse.data, null, 2));
        } catch (error) {
            console.log('✗ Search failed without auth:', error.response?.status, error.response?.statusText);
            
            // If we have a token, try with authentication
            if (token) {
                console.log('\n4. Testing BGMI search with authentication...');
                try {
                    const searchResponse = await axios.get(`${baseUrl}/game-stats/bgmi/search`, {
                        params: { playerName: 'JONATHAN' },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    console.log('✓ Search successful with auth');
                    console.log('Response:', JSON.stringify(searchResponse.data, null, 2));
                    
                    // Check if the malformed JSON fix is working
                    if (searchResponse.data.success && searchResponse.data.data) {
                        console.log('\n✅ BGMI Player Search API is working correctly!');
                        console.log('The malformed JSON fix appears to be functioning properly.');
                        console.log(`Found ${searchResponse.data.data.length} player(s)`);
                        
                        // Display player details
                        searchResponse.data.data.forEach((player, index) => {
                            console.log(`\nPlayer ${index + 1}:`);
                            console.log(`- ID: ${player.id}`);
                            console.log(`- Name: ${player.name}`);
                            console.log(`- Shard: ${player.shardId}`);
                            console.log(`- Matches: ${player.matchIds?.length || 0}`);
                        });
                    }
                } catch (error) {
                    console.log('✗ Search failed with auth:', error.response?.data || error.message);
                }
            }
        }
        
        // Test with different player names
        if (token) {
            console.log('\n5. Testing with different player names...');
            const testNames = ['MORTAL', 'SCOUT', 'DYNAMO'];
            
            for (const name of testNames) {
                try {
                    const searchResponse = await axios.get(`${baseUrl}/game-stats/bgmi/search`, {
                        params: { playerName: name },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (searchResponse.data.success && searchResponse.data.data?.length > 0) {
                        console.log(`✓ Found player "${name}"`);
                    } else {
                        console.log(`✗ No results for "${name}"`);
                    }
                } catch (error) {
                    console.log(`✗ Error searching for "${name}":`, error.response?.status);
                }
            }
        }
        
    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

// Check if axios is installed
try {
    require.resolve('axios');
    testBgmiSearch();
} catch (e) {
    console.log('Installing axios...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('Axios installed. Please run the script again.');
}