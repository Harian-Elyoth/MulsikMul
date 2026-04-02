# Android + Node.js build image for MulsikMul
# Java 17 (Temurin), Android SDK 35, Node.js 20
FROM eclipse-temurin:17-jdk-jammy

# System tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    unzip \
    git \
    ca-certificates \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 (via NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Android SDK (command-line tools only)
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=$ANDROID_HOME
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
         -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d /tmp/ct \
    && mv /tmp/ct/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm -rf /tmp/ct /tmp/cmdline-tools.zip

# Accept licenses and install required SDK components
RUN yes | sdkmanager --licenses \
    && sdkmanager \
        "platform-tools" \
        "platforms;android-35" \
        "build-tools;35.0.0"

# Pre-download Gradle 8.8 distribution so the wrapper skips the network fetch at build time
RUN mkdir -p /root/.gradle/wrapper/dists \
    && wget -q https://services.gradle.org/distributions/gradle-8.8-bin.zip \
         -O /root/.gradle/wrapper/dists/gradle-8.8-bin.zip

WORKDIR /app

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/patch-signing.py /patch-signing.py
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
