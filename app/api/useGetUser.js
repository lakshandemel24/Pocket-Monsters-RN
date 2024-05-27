import React, { useEffect, useState } from 'react';


const useGetUser = (sid, uid) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await CommunicationController.getUser(sid, uid);
                setUsers(response);
            } catch (error) {
                console.error("useGetRanking Errors: " + error);
            }
        };

        getUsers();
    }, [sid]);

    return users;
}

export default useGetUser;