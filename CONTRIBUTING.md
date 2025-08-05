# Contributing to Velink 🤝

First off, thank you for considering contributing to Velink! It's people like you that make Velink such a great tool. 🙏

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Velink Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- Basic knowledge of JavaScript/TypeScript and React

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/velink.git
   cd velink
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your development settings
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Verify setup**
   - Frontend: https://velink.me
   - Backend: https://velink.me
   - Admin Panel: https://velink.me/admin

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/velyzo/velink/issues) as you might find that the issue has already been reported.

**When filing a bug report:**
- Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- Include as much detail as possible
- Provide steps to reproduce
- Include screenshots if applicable
- Mention your environment (OS, browser, Node.js version)

### ✨ Suggesting Features

Feature suggestions are welcome! Please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:

- Clear description of the feature
- Use cases and benefits
- Any relevant examples or mockups
- Consider implementation complexity

### 📖 Improving Documentation

Documentation improvements are always appreciated:

- Fix typos and grammatical errors
- Improve clarity and completeness
- Add examples and tutorials
- Update outdated information
- Improve API documentation

### 💻 Code Contributions

1. **Choose an issue** - Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the issue** - Let others know you're working on it
3. **Create a branch** - Use a descriptive name like `fix/admin-login-bug`
4. **Make your changes** - Follow our coding standards
5. **Test thoroughly** - Ensure all tests pass and add new tests if needed
6. **Submit a pull request** - Use our PR template

## 🔧 Development Process

### Branch Strategy

- `main` - Stable production code
- `develop` - Integration branch for features
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates

### Local Development

```bash
# Start development servers
npm run dev

# Run tests
npm test
npm run test:client
npm run test:server

# Lint code
npm run lint
npm run lint:fix

# Build for production
npm run build
```

### Testing

- Write unit tests for new functions
- Add integration tests for new features
- Test in multiple browsers
- Verify mobile responsiveness
- Test API endpoints with different inputs

## 🎨 Style Guidelines

### JavaScript/TypeScript

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Follow existing code patterns

```javascript
/**
 * Shortens a URL and returns the result
 * @param {string} url - The URL to shorten
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} The shortened URL data
 */
async function shortenUrl(url, options = {}) {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Follow React best practices
- Use TypeScript interfaces for props
- Add proper error boundaries

```tsx
interface LinkCardProps {
  link: LinkData;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onDelete, onToggle }) => {
  // Component implementation
};
```

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic class names for custom CSS

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Include comprehensive error messages
- Validate all inputs
- Document endpoints thoroughly

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(api): add bulk URL shortening endpoint

Add new endpoint that allows users to shorten multiple URLs
in a single request, improving efficiency for bulk operations.

Closes #123

fix(admin): resolve delete button not working

The delete button in admin panel was using wrong parameter.
Changed from _id to shortCode to match backend expectations.

Fixes #456

docs(readme): improve installation instructions

Add more detailed setup steps and troubleshooting section
to help new contributors get started faster.
```

## 🔄 Pull Request Process

1. **Ensure your code follows our guidelines**
   - All tests pass
   - Code is properly formatted
   - No console.log statements
   - TypeScript types are correct

2. **Update documentation**
   - Update README if needed
   - Add/update API documentation
   - Include inline code comments

3. **Create a descriptive PR**
   - Use our PR template
   - Include screenshots for UI changes
   - Link related issues
   - Describe testing performed

4. **Request review**
   - PRs require at least one review
   - Address all feedback
   - Keep discussions professional and constructive

5. **Merge requirements**
   - All CI checks must pass
   - No merge conflicts
   - Branch must be up to date with main

## 🏗️ Project Structure

```
velink/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── database/         # Database functions
│   ├── utils/            # Utility functions
│   └── package.json
├── .github/              # GitHub configurations
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
└── docs/                 # Additional documentation
```

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions
- Mock external dependencies
- Cover edge cases and error scenarios
- Aim for high code coverage

### Integration Tests
- Test API endpoints
- Test database interactions
- Test component integration
- Use realistic test data

### Manual Testing
- Test in different browsers
- Verify mobile responsiveness
- Test with different screen sizes
- Validate accessibility

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest Testing Framework](https://jestjs.io/)

## 🎯 Good First Issues

New to the project? Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Community contributions welcome
- `documentation` - Help improve our docs
- `bug` - Fix existing issues

## 🤔 Questions?

- 💬 [GitHub Discussions](https://github.com/velyzo/velink/discussions)
- 📧 [Email Support](mailto:mail@velyzo.de)
- 🐛 [Report a Bug](https://github.com/velyzo/velink/issues/new?template=bug_report.yml)
- ✨ [Request a Feature](https://github.com/velyzo/velink/issues/new?template=feature_request.yml)

## 🙏 Recognition

Contributors will be:
- Added to our Contributors section
- Mentioned in release notes
- Given credit in documentation
- Invited to join our maintainers team (for regular contributors)

---

Thank you for contributing to Velink! Together, we can build the best URL shortener platform. 🚀
