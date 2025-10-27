import {createRouter, createWebHistory} from "vue-router";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
const HomeView = () => import('./shared/presentation/views/home.vue');

// when you want to change the path, change it here and then go to the layout.vue file and change it there too
const routes = [
    { path: '/home',            name: 'home',           component: HomeView, meta: { title: 'Home' } },
    //{path: '/cherryton', name: 'cherryton', children: blueLockRoutes},
    { path: '/',                redirect: '/home' },
    { path: '/:pathMatch(.*)*', name: 'not-found',      component: pageNotFound, meta: { title: 'Page not found' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'smartstay-app'; // You can change this to your app's base title
    document.title = `${to.meta["title"]} | ${baseTitle}`;
    next();
});

export default router;