//
// Created by aidankeefe on 5/25/26.
//
#include "../include/cleanPath.h"

void cleanPath(struct aid_string* path) {

    for (i32 i = 0; i < path->length; i++) {
        if (i+1 < path->length) {
            if (path->s[i] == '.' && path->s[i+1] == '.') {
                path->s[i++] = '/';
                path->s[i] = '/';
            }
        }
    }

}
