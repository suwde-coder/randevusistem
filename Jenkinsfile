pipeline {
    agent any
    
    triggers {
        githubPush()
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
            }
        }

        stage('Configuration') {
            steps {
                echo 'Setting up environment files...'
                script {
                    dir('server') {
                        // Create .env if it doesn't exist to prevent crash
                        bat 'if not exist .env (echo PORT=5000 > .env && echo NODE_ENV=production >> .env && echo MONGODB_URI=mongodb://localhost:27017/randevu >> .env && echo JWT_SECRET=jenkins_temporary_secret >> .env)'
                    }
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing server-side dependencies using npm ci...'
                dir('server') {
                    bat 'npm ci'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing client-side dependencies using npm ci...'
                dir('client') {
                    bat 'npm ci'
                }
            }
        }

        stage('Backend Quality & Check') {
            parallel {
                stage('Backend Syntax Check') {
                    steps {
                        echo 'Verifying backend script syntax...'
                        dir('server') {
                            bat 'node --check server.js'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        echo 'Running server unit tests...'
                        dir('server') {
                            bat 'npm test'
                        }
                    }
                }
            }
        }

        stage('Frontend Quality & Check') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        echo 'Running ESLint on frontend...'
                        dir('client') {
                            bat 'npm run lint'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        echo 'Running React unit tests...'
                        dir('client') {
                            bat 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building production bundle...'
                dir('client') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
        }
        success {
            echo '====================================='
            echo 'SUCCESS: CI/CD Pipeline completed!'
            echo '====================================='
        }
        failure {
            echo '====================================='
            echo 'FAILED: Pipeline failed during execution.'
            echo 'Check stage logs for detailed errors.'
            echo '====================================='
        }
    }
}
