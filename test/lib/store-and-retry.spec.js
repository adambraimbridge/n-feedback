const { expect } = require("chai");
const storeAndRetry = require("../../src/lib/store-and-retry");
const surveyId = "Survey123";
const surveyData = "Are you happy today?";
const surveyResponse = "Sort of...I think I need some holidays";
const additionalData = "...that's life mate, that's life...";
const defaultResponse = {
  surveyId,
  surveyData,
  surveyResponse,
  additionalData
};

describe.only("Store and retry", () => {
  describe("provides fault tolerancy to not lose users feedbacks", () => {
    describe("attemptToPostPrestoredResponses should be run on load", () => {
      it("resolves immediately if there are no stored responses", done => {
        // Empty storage.
        let items = {};
        const storageMock = {
          getItem: key => items[key],
          removeItem: key => delete items[key],
          setItem: (key, value) => (items[key] = value)
        };
        const overrideDefaults = {
          storage: storageMock
        };
        const storeAndRetryInstance = storeAndRetry.init(
          overrideDefaults,
          true
        );
        storeAndRetryInstance
          .attemptToPostPrestoredResponses()
          .then(expectedReasonForResolution => {
            expect(expectedReasonForResolution).to.be.equal(
              "No previous stored response present"
            );
            done();
          });
      });
      it("resolves immediately if the storage is not supported so data cannot be stored", done => {
        let items = {};
        // getItem is removed to simulate not writable storage.
        const storageMock = {
          removeItem: key => delete items[key],
          setItem: (key, value) => (items[key] = value)
        };
        const overrideDefaults = {
          storage: storageMock
        };
        const storeAndRetryInstance = storeAndRetry.init(
          overrideDefaults,
          true
        );
        storeAndRetryInstance
          .attemptToPostPrestoredResponses()
          .then(expectedReasonForResolution => {
            expect(expectedReasonForResolution).to.be.equal(
              "Storage not supported"
            );
            done();
          });
      });
      describe("if there is a stored response, attempt to send it again", () => {
        it("it tries immediately, and if succeeded it clear the stored data", function(done) {
          // Simulate the presence of previously stored data.
          let items = {
            "n-feedback-response": JSON.stringify(defaultResponse)
          };
          const storageMock = {
            getItem: key => items[key],
            removeItem: key => delete items[key],
            setItem: (key, value) => (items[key] = value)
          };
          function postResponseMock() {
            // Resolve at first attempt.
            return Promise.resolve();
          }
          const overrideDefaults = {
            storage: storageMock,
            postResponse: postResponseMock
          };
          const storeAndRetryInstance = storeAndRetry.init(
            overrideDefaults,
            true
          );
          storeAndRetryInstance
            .attemptToPostPrestoredResponses()
            .then(expectedReasonForResolution => {
              expect(storageMock.getItem("n-feedback-response")).to.be
                .undefined;
              expect(expectedReasonForResolution).to.be.equal(
                "Suceeded at attempts number 1"
              );
              done();
            });
        });
        it("if the network is not stable, it will retry, and if succeeded it clear the stored data", function(done) {
          // Simulate the presence of previously stored data.
          let items = {
            "n-feedback-response": JSON.stringify(defaultResponse)
          };
          const storageMock = {
            getItem: key => items[key],
            removeItem: key => delete items[key],
            setItem: (key, value) => (items[key] = value)
          };

          function* simulateUnstableNetwork() {
            // First and second attempt will fail.
            yield Promise.reject();
            yield Promise.reject();
            // Third attempt will succeed.
            yield Promise.resolve();
          }

          const networkState = simulateUnstableNetwork();

          function postResponseMock() {
            // Wobbly connection...comes and goes.
            return networkState.next().value;
          }

          const overrideDefaults = {
            storage: storageMock,
            postResponse: postResponseMock,
            maxRetries: 5,
            intervalBetweenAttempts: 10
          };
          const storeAndRetryInstance = storeAndRetry.init(
            overrideDefaults,
            true
          );
          storeAndRetryInstance
            .attemptToPostPrestoredResponses()
            .then(expectedReasonForResolution => {
              expect(storageMock.getItem("n-feedback-response")).to.be
                .undefined;
              expect(expectedReasonForResolution).to.be.equal(
                "Suceeded at attempts number 3"
              );
              done();
            });
        });
        it("after a certain amount of time it will abandon but does not clear the stored data", function(done) {
          // Simulate the presence of previously stored data.
          let items = {
            "n-feedback-response": JSON.stringify(defaultResponse)
          };
          const storageMock = {
            getItem: key => items[key],
            removeItem: key => delete items[key],
            setItem: (key, value) => (items[key] = value)
          };
          function postResponseMock() {
            // Consistently fails, you really should change network provider...
            return Promise.reject();
          }
          const overrideDefaults = {
            storage: storageMock,
            postResponse: postResponseMock,
            maxRetries: 5,
            intervalBetweenAttempts: 10
          };
          const storeAndRetryInstance = storeAndRetry.init(
            overrideDefaults,
            true
          );
          storeAndRetryInstance
            .attemptToPostPrestoredResponses()
            .then(expectedReasonForResolution => {
              expect(storageMock.getItem("n-feedback-response")).to.be.equal(
                JSON.stringify(defaultResponse)
              );
              expect(expectedReasonForResolution).to.be.equal(
                "Reached the maximum amount of retries (5)"
              );
              done();
            });
        });
      });
    });
    describe("postResponseWithRetry", () => {
      describe("programmatically try to post a response", () => {
        it("if succeed it does not do anything else", done => {
          let items = {
            "n-feedback-response": JSON.stringify(defaultResponse)
          };
          const storageMock = {
            getItem: key => items[key],
            removeItem: key => delete items[key],
            setItem: (key, value) => (items[key] = value)
          };
          function postResponseMock() {
            // Resolve immediately, lucky day for the Customer Research Team.
            return Promise.resolve();
          }
          const overrideDefaults = {
            storage: storageMock,
            postResponse: postResponseMock
          };
          let storeAndRetryInstance = null;
          storeAndRetryInstance = storeAndRetry.init(overrideDefaults, true);

          storeAndRetryInstance
            .postResponseWithRetry(
              surveyId,
              surveyData,
              surveyResponse,
              additionalData
            )
            .then(expectedReasonForResolution => {
              expect(expectedReasonForResolution).to.be.equal(
                "Suceeded at attempts number 1"
              );
              // It shouldn't store anything if succeed.
              expect(storageMock.getItem("n-feedback-response")).to.be
                .undefined;
              done();
            });
        });
        it("if fails, it stores data locally as a precautionary measure for future attempts", done => {
          let items = {
            "n-feedback-response": JSON.stringify(defaultResponse)
          };
          const storageMock = {
            getItem: key => items[key],
            removeItem: key => delete items[key],
            setItem: (key, value) => (items[key] = value)
          };
          function postResponseMock() {
            // Offline...this will not end up well!!
            return Promise.reject("You are offline");
          }
          const overrideDefaults = {
            storage: storageMock,
            postResponse: postResponseMock,
            maxRetries: 2,
            intervalBetweenAttempts: 10
          };
          let storeAndRetryInstance = null;
          storeAndRetryInstance = storeAndRetry.init(overrideDefaults, true);

          storeAndRetryInstance
            .postResponseWithRetry(
              surveyId,
              surveyData,
              surveyResponse,
              additionalData
            )
            .then(expectedReasonForResolution => {
              expect(storageMock.getItem("n-feedback-response")).to.be.equal(
                JSON.stringify(defaultResponse)
              );
              done();
            });
        });
      });
    });
  });
});
