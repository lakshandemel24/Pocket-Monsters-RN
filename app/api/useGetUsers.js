import { useEffect, useState } from 'react';
import CommunicationController from './CommunicationController';

const useGetUsers = (sid, lat, lon) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await CommunicationController.getUsers(sid, lat, lon);
                setUsers(response);
                //console.log(response);
            } catch (error) {
                console.error("useGetUSers Errors: " + error);
            }
        };

        getUsers();
    }, [sid, lat, lon]);

    return users;
}

export default useGetUsers;