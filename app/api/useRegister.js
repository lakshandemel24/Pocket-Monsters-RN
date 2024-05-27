import { useEffect, useState } from 'react';
import CommunicationController from './CommunicationController';

const useRegister = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const registerUser = async () => {
            try {
                const userData = await CommunicationController.register();
                setUser(userData);
            } catch (error) {
                console.error("useRegister Errors: " + error);
            }
        };

        registerUser();

    }, []); // Empty dependency array ensures this effect runs only once

    return user;
};

export default useRegister;
