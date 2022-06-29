module.exports = {
  plugins: ['react', 'react-hooks'],
  extends: [
    '../../.eslintrc.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        "import/order": ["error",
          {
            "groups":
              [
                "external",
                "builtin",
                "internal",
                "sibling",
                "parent",
                "index"
              ]
          }
        ]
      },
    },
  ],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
};
