const settings = (data) => {
    console.log('POST settings: ', data);
};

const return_rules = (data) => {
    console.log('POST return rules', data);

};

const return_reasons = (data) => {
    console.log('POST reasons: ', data);
};

const shipping_label = () => {

};

const packing_slip = () => {

};

const API = {
    settings,
    return_rules,
    return_reasons
};

module.exports = API;