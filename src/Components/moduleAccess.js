import { isEqualNumber } from './functions';

export const getModuleAccess = (data = [], code = '', crudAction = 1) => {

    if (!data || !Array.isArray(data) || data.length === 0) return false;

    const actions = {
        1: 'createOption',
        2: 'getOption',
        3: 'updateOption',
        4: 'deleteOption'
    }

    if (code) {
        return data.some(item => {
            const action = actions[crudAction] || '';
            if (item.ruleCode === code && action) {
                return isEqualNumber(item[action], 1);
            }
            if (item.ruleCode === code) {
                return {
                    createAccess: isEqualNumber(item?.createOption, 1),
                    readAccess: isEqualNumber(item?.getOption, 1),
                    updateAccess: isEqualNumber(item?.updateOption, 1),
                    deleteAccess: isEqualNumber(item?.deleteOption, 1)
                }
            }
            return false;
        })
    }
    return false;
}


// isEqualNumber(item[actions[crudAction]], 1)