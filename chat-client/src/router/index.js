import {createRouter, createWebHistory} from 'vue-router'
import LogIn from "../views/logIn.vue";
import MessagingPage from "../views/messages.vue";

const routes = [
    // {
    //     path: '/:pathMatch(.*)*',
    //     name: 'NotFound',
    //     component: NotFound
    // },
    {
        path: '/',
        component: LogIn,

    },
    {
        path: '/messaging',
        component: MessagingPage,

    },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {top: 0}
        }
    }
})

export default router