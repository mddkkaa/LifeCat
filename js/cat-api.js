// =========================================================
//  LifeCat — API для работы с котом (фронт)
//  Требует js/api.js (там объект API)
// =========================================================

const CatAPI = {
    get() {
        return API.get('/api/cat').then(d => d.cat);
    },
    create(name, gender, tribe) {
        return API.post('/api/cat', { name, gender, tribe }).then(d => d.cat);
    },
    saveColor(fur, eye) {
        return API.put('/api/cat/color', { fur, eye }).then(d => d.cat);
    },
    requestDeletion() {
        return API.post('/api/cat/delete');
    },
    cancelDeletion() {
        return API.post('/api/cat/cancel-delete');
    },
    changePassword(oldPassword, newPassword) {
        return API.post('/api/change-password', { oldPassword, newPassword });
    },
    changeEmail(email) {
        return API.post('/api/change-email', { email });
    },
};