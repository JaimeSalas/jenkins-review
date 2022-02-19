def front
def back 

def withDockerNetwork(Closure inner) {
    try {
        networkId = UUID.randomUUID().toString();
        sh "docker network create ${networkId}";
        inner.call(networkId);
    } finally {
        sh "docker network rm ${networkId}"
    }
}

pipeline {
    agent any 

    stages {
        stage('build front') {
            steps {
                script {
                    front = docker.build(
                        "jaimesalas/e2e",
                        "--pull -f $WORKSPACE/e2e/front/Dockerfile.e2e $WORKSPACE/e2e/front"
                    )
                }
            }
        }

        stage('Build back') {
            steps {
                script {
                    back = docker.build(
                        "jaimesalas/e2e-back",
                        "--pull -f $WORKSPACE/e2e/back/Dockerfile $WORKSPACE/e2e/back"
                    )
                }
            }
        }

        stage('e2e') {
            steps {
                script {
                    // docker.script.sh(script: "docker run --rm jaimesalas/e2e npm run test:e2e:local", returnStdout: false)
                    withDockerNetwork{n -> 
                        back.withRun("--name e2e-back --network ${n} -e PORT=4000") {c ->
                            docker.script.sh(
                                script: "docker run --rm -e API_URL=http://e2e-back:4000 --network ${n} jaimesalas/e2e npm run test:e2e",
                                returnStdout: false
                            )
                        }
                    }
                }
            }
        }
    }
}

