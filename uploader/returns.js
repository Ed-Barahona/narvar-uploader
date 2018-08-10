const logger = console;


const settings = (data) => {
    return new Promise((resolve) => {
        logger.log('POST settings: ');
        resolve('success');
    });
};

const return_rules = (data) => {
    return new Promise((resolve) => {
        logger.log('POST return_rules: ');
        resolve('success');
    });
};

const reason_codes = (data) => {
    return new Promise((resolve) => {
        logger.log('POST return_reasons: ');
        resolve('success');
    });
};

const shipping_label = (data) => {
    return new Promise((resolve) => {
        logger.log('POST shipping_label: ');
        resolve('success');
    });
};

const packing_slip = (data) => {
    return new Promise((resolve) => {
        logger.log('POST packing_slip: ');
        resolve('success');
    });
};

const API = {
    settings,
    return_rules,
    reason_codes,
    shipping_label,
    packing_slip
};

module.exports = API;