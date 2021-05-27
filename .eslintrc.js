module.exports = {
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
        '@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    env: {
        node: true,
        mocha: true,
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
            },
        ],
        'import/no-unresolved': 'off',
        'import/prefer-default-export': 'off',
        'lines-between-class-members': 'off',
        'no-await-in-loop': 'off',
        'no-useless-constructor': 'off',
        'max-len': ['error', { code: 160 }],
        indent: [
            'error',
            4,
        ],
    },
};
