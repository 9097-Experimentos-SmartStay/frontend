import CreateProfile from './views/CreateProfile.vue';
import ProfileDetail from './views/ProfileDetail.vue';
import AllProfiles from './views/AllProfiles.vue';

export const profileRoutes = [
    {
        path: '/profiles',
        name: 'AllProfiles',
        component: AllProfiles,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profiles/create',
        name: 'CreateProfile',
        component: CreateProfile,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profiles/:id',
        name: 'ProfileDetail',
        component: ProfileDetail,
        props: true,
        meta: {
            requiresAuth: true
        }
    }
];