var app = angular.module("photoSelectDemo", ["ui.bootstrap", 'ngFileUpload', 'angularUtils.directives.dirPagination', 'codeAppImageCropper']);

app.controller('myController', ['$scope', function ($scope) {

}]);

app.controller("choosePhotoModalDirectiveController", ["$scope", "$uibModal", "$log", '$location', function ($scope, $uibModal, $log, $location, onSelectCallback) {

    $scope.choosePhotoModal = function () {
        
        var modalInstance = $uibModal.open({
            animation: false,
            backdrop: 'static',
            templateUrl: 'choosePhotoModalContent.html',
            controller: 'choosePhotoModalController',
            size: 'md',
            resolve: {
                maxWidth: function () {
                    return $scope.maxWidth
                },
                ratio: function () {
                    return $scope.ratio
                }
            }
        });

        modalInstance.result.then(function (picToUse) {
            $scope.onSelectCallback({
                arg1: picToUse,
                arg2: $scope.callbackArgs
            });
        })

    }
}]);

app.controller("choosePhotoModalController", ['$scope', "$uibModalInstance", '$uibModal', 'Upload', "$timeout", 'maxWidth', 'ratio', '$window', '$q', '$rootScope', 'indexedDBDataSvc', function ($scope, $uibModalInstance, $uibModal, Upload, $timeout, maxWidth, ratio, $window, $q, $rootScope, indexedDBDataSvc) {
    //sagar

    $scope.showImg = false;
    $scope.codeappCropperAPI = "";
    $scope.chnageFile = function () {
        $scope.showImg = false;
        var file = $scope.userFile;
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            // preview.src = reader.result;
            $scope.imgBase64 = reader.result;
            $scope.$apply(function () {
                $scope.showImg = true;
            });
            // alert($scope.imgBase64);
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    $scope.codeAppCroper = function (codeappCropper) {
        $scope.codeappCropperAPI = codeappCropper;
    }
    $scope.UseImage = function () {
        var resultImage = $scope.codeappCropperAPI.crop();
        indexedDBDataSvc.addTodo($scope.imgBase64, resultImage).then(function () {
        }, function (err) {
            $window.alert(err);
        });
    }
    $scope.UpdateImageAbhay = function (id) {
        var resultImage = $scope.codeappCropperAPI.crop();
        indexedDBDataSvc.updateResult(id, resultImage).then(function () {
        }, function (err) {
            $window.alert(err);
        });
    }
    $scope.clear = function () {
        $scope.userFile = null;
        $scope.showImg = false;
    }


    //abhay

    $scope.todos = [];

    $scope.refreshList = function () {
        indexedDBDataSvc.getTodos().then(function (data) {
            $scope.todos = data;
        }, function (err) {
            $window.alert(err);
        });
    };


    $scope.addTodo = function () {
        indexedDBDataSvc.addTodo($scope.todoText).then(function () {
            $scope.refreshList();
            $scope.todoText = "";
            $scope.todoText.focus();
        }, function (err) {
            $window.alert(err);
        });
    };

    $scope.deleteTodo = function (id) {
        indexedDBDataSvc.deleteTodo(id).then(function () {
            $scope.refreshList();
        }, function (err) {
            $window.alert(err);
        });
    };

    // $scope.UpdateImage = function (id) {
    //     indexedDBDataSvc.deleteTodo(id).then(function () {
    //         $scope.refreshList();
    //     }, function (err) {
    //         $window.alert(err);
    //     });
    // };

    function init() {
        indexedDBDataSvc.open().then(function () {
            $scope.refreshList();
        });
    }

    init();


    $scope.showMode = 'Upload';
    $scope.files = [];
    $scope.maxWidth = maxWidth;
    $scope.ratio = ratio;
    $scope.contents = [];
    $scope.picToUse = "";

    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });

    $scope.setView = function () {
        $scope.showMode = 'Select';
        $scope.refreshList();
        $scope.getProfileContent();
    }

    function setSizes() {

        document.getElementById('imageSizer').style.height = ((document.getElementById('imageSizer').clientWidth) / ratio) + 'px';
        document.getElementById('imageSizerDrop').style.height = ((document.getElementById('imageSizer').clientWidth) / ratio) + 'px';
        //else set modal height to 400
        // what's the most pics we can fit on a screen?

        //set header height
        if ($window.innerWidth < 769) {
            var headerHeight = 80;
            var padHeight = 22;
        } else {
            var headerHeight = 40;
            var padHeight = 62;
        }
        $scope.mostPics = Math.floor(($window.innerHeight - padHeight - 45 - headerHeight - 75) / 86) * Math.floor((document.getElementById('bbb').clientWidth - 28) / 128);
        var rowss = ($window.innerHeight - 22 - 45 - headerHeight - 75) / 86;
        var cols = (document.getElementById('bbb').clientWidth - 30) / 128;
        if ($scope.mostPics < 12) {
            //using full screen
            var scnWidth = $window.innerWidth;
            var scnHeight = $window.innerHeight;

            //set height of modal

            document.getElementById('bbb').style.height = (scnHeight - padHeight) + 'px';

            //set canvas height
            var canvasHeight = (scnHeight - padHeight - headerHeight - 90);
            var canvasWidth = document.getElementById('canvas').clientWidth;
            document.getElementById('canvas').style.height = canvasHeight + 'px';

        } else {
            //not using full screen
            var rows = Math.ceil(12 / Math.floor((document.getElementById('bbb').clientWidth - 30) / 128));
            $scope.mostPics = 12;
            if ($window.innerWidth < 769) {

                //set height of modal
                document.getElementById('bbb').style.height = ((rows * 86) + 112 + 80) + 'px';

                var canvasHeight = (rows * 86) + 30;
                var canvasWidth = document.getElementById('canvas').clientWidth;
                document.getElementById('canvas').style.height = canvasHeight + 'px';
            } else {
                //set height of modal
                document.getElementById('bbb').style.height = ((rows * 86) + 112 + 30) + 'px';
                var canvasHeight = (rows * 86);
                var canvasWidth = document.getElementById('canvas').clientWidth;
                document.getElementById('canvas').style.height = canvasHeight + 'px';
            }
        }
        //set imageSizer / imageSizerDrop
        var maxImgWidth = Math.min(maxWidth, canvasWidth);
        var maxImgHeight = Math.min(maxWidth / ratio, canvasHeight);

        if (maxImgWidth / ratio > maxImgHeight) {
            var actHeight = maxImgHeight;
            var actWidth = actHeight * ratio;
        } else {
            var actWidth = maxImgWidth;
            var actHeight = actWidth / ratio;

        }

        document.getElementById('imageSizer').style.height = (actHeight) + 'px';
        document.getElementById('imageSizerDrop').style.height = actHeight + 'px';
        document.getElementById('imageSizer').style.width = actWidth + 'px';
        document.getElementById('imageSizerDrop').style.width = actWidth + 'px';
        $scope.actHeight = actHeight;
        $scope.actWidth = actWidth;
        if (!$scope.$$phase) { $scope.$digest(); }
        return;


    }

    $uibModalInstance.rendered.then(function () {
        //if xs device set modal to full screen
        setSizes();
        //set imagesizer ratio


    })
    angular.element($window).on('resize', function () {
        setSizes();
    });

    $scope.getProfileContent = function () {
        $scope.contents.length = 0
        signalRContent.actions.getAllProfileContent().then(function (response) {
            angular.forEach(response, function (value, key) {
                $scope.contents.push(value);
            })
            // console.log($scope.contents);
        });
    };

    $scope.setPicToUse = function (photoId) {
        $scope.picToUse = photoId;
        $scope.showMode = 'Selected';
    }
    $scope.showImgSelected = false;
    $scope.setPicToUseByCodeApp = function (id, images, cropImg) {
        $scope.showImgSelected = false;
        $scope.imgBase64selected = "";
        $scope.currId = id;
        $timeout(function () {

            $scope.imgBase64selected = cropImg;
            $scope.imgBase64Orignal = images;
            $scope.imgBase64crop = cropImg;
            $scope.showImgSelected = true;
            $scope.showMode = 'Selected';
        }, 200);

    }

    $scope.isSetOrignal = false;

    $scope.setOrignal = function () {
        $scope.showImgSelected = false;
        $scope.isSetOrignal = !$scope.isSetOrignal;
        $timeout(function () {
            if ($scope.isSetOrignal) {
                $scope.imgBase64selected = $scope.imgBase64Orignal;
            } else {
                $scope.imgBase64selected = $scope.imgBase64crop;
            }

            $scope.showImgSelected = true;
            $scope.showMode = 'Selected';
        }, 200);
    }

    $scope.myButtonLabels = {
        rotateLeft: ' (rotate left) ',
        rotateRight: ' (rotate right) ',
        zoomIn: ' (zoomIn) ',
        zoomOut: ' (zoomOut) ',
        fit: ' (fit) ',
        crop: ' [crop] '
    };

    $scope.UpdateImage = function (base64) {

        $scope.resultImageSelect = base64;
        $scope.$apply(); // Apply the changes.
        indexedDBDataSvc.addTodo(base64).then(function () {
        }, function (err) {
            $window.alert(err);
        });
    };

    $scope.manageUI = function () {
        // $scope.picToUse = photoId;
    }

    $scope.cropImgLoaded = function () {
        try {
            var x = $scope.getCrop()
            return false;
            // safe to use the function
        } catch (err) {
            return true;
        }
    }
    $scope.cropImgLoadedURL = function () {
        try {
            var x = $scope.getCropURL()
            return false;
            // safe to use the function
        } catch (err) {
            return true;
        }
    }

    $scope.useExisitingPic = function () {
        $scope.isLoading = true;
        var imageData = $scope.getCrop();
        var imageB64 = imageData.toDataURL('image/jpeg');
        $scope.files[0] = Upload.dataUrltoBlob(imageB64, "abc");
        $scope.uploadAndSet();
    }
    $scope.uploadNew = function () {
        $scope.isLoading = true;
        $scope.uploadFiles($scope.files); //upload original
        var imageData = $scope.getCropURL(); // get cropped data
        var imageB64 = imageData.toDataURL('image/jpeg'); //convert image
        $scope.files[0] = Upload.dataUrltoBlob(imageB64, "abc"); //set files obeject to upload cropped image
        $scope.uploadAndSet(); //resize and upload

    }


    // Upload photo directive eventually...



    $scope.uploadAndSet = function () {
        $scope.setPicFlag = true;
        if ($scope.files) {
            var resizeOptions = {
                width: $scope.maxWidth,
                height: $scope.maxWidth / $scope.ratio,
                type: 'image/jpeg',
                quality: 1
            }
            Upload.resize($scope.files[0], resizeOptions).then(function (resizedFile) {
                $scope.files[0] = resizedFile;
                $scope.uploadFiles($scope.files);
            });

        }
    }
    $scope.uploadFiles = function (files, errFiles) {
        $scope.files = files;
        $scope.errFiles = errFiles;
        angular.forEach(files, function (file) {
            // Create photo resource
            signalRContent.actions.getUploadLocationForPhoto()
                .then(function (response) { // Success getting new photo resource  
                    var photoServiceResponse = response;
                    file.photoId = photoServiceResponse.Id;

                    var composedHeaders = {
                        'Content-Type': file.type
                    };

                    angular.forEach(photoServiceResponse.UploadUriHeaders, function (headerData) {
                        composedHeaders[headerData.Key] = headerData.Value;
                    });

                    // Put photo in returned location
                    file.upload = Upload.http({
                        url: photoServiceResponse.UploadUri,
                        method: photoServiceResponse.UploadUriMethod,
                        headers: composedHeaders,
                        data: file
                    });

                    file.upload.then(function (response) {
                        $timeout(function () {
                            // Tell photo svc upload completed
                            signalRContent.actions.photoUploadComplete(photoServiceResponse.Id)
                                .then(function (response) {
                                    file.result = response;

                                    signalRContent.actions.getUriForPhotoId(photoServiceResponse.Id).then(function (uri) {
                                        file.sourceUri = uri;
                                    });

                                    signalRContent.actions.createPhotoContent(photoServiceResponse.Id).then(function (response) {
                                        var uploadedPic = {
                                            'Type': 'Photo',
                                            'Value': file.photoId
                                        };
                                        if ($scope.setPicFlag) {
                                            $scope.picToUse = uploadedPic;
                                            $uibModalInstance.close(uploadedPic);
                                        }
                                        // $scope.refreshProfileContent();
                                    });
                                })
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            var actualUploadErrorResponse = response;
                            // Tell photo svc upload aborted
                            signalRContent.actions.photoUploadAbort(photoServiceResponse.Id)
                                .then(function (response) {
                                    $scope.errorMsg = actualUploadErrorResponse.status + ': ' + actualUploadErrorResponse.data;
                                })
                        }
                    }, function (evt) {
                        $scope.progress = Math.min(100, parseInt(100.0 *
                            evt.loaded / evt.total));
                    });

                }, function (response) { // Failure getting new photo resource
                    //response.status
                    //response.data
                })
        });
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    var signalRContent = {};
    signalRContent.actions = {};
    signalRContent.actions.getAllProfileContent = function () {
        var deferred = $q.defer();
        var data = [];
        for (var i = 0; i < 25; i++) {
            var rand = Math.floor(Math.random() * 600) + 300
            data.push({
                Data: {
                    Type: 'Photo',
                    Value: 400 + i
                }

            })
        }

        deferred.resolve(data);


        return deferred.promise;
    };

    // signalRContent.actions.getUploadLocationForPhoto()
    // signalRContent.actions.photoUploadComplete(photoServiceResponse.Id)
    // signalRContent.actions.getUriForPhotoId(photoServiceResponse.Id)
    // signalRContent.actions.createPhotoContent(photoServiceResponse.Id)



}
]);