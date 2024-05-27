import { useEffect, useState } from 'react';
import CommunicationController from './CommunicationController';

const useGetRanking = (sid) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await CommunicationController.getRanking(sid);
                setUsers(response);
            } catch (error) {
                console.error("useGetRanking Errors: " + error);
            }
        };

        getUsers();
    }, [sid]);

    return users;
}

export default useGetRanking;