//
// Created by aidankeefe on 5/25/26.
//
#include "../include/server.h"
#include "../src/cleanPath.c"
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stdio.h>
#include <dirent.h>


int is_directory(const char *path) {
    struct stat path_stat;
    if (stat(path, &path_stat) != 0) {
        return 0; // Path does not exist or cannot be accessed
    }
    return S_ISDIR(path_stat.st_mode);
}

void callback(WOLFSSL* ssl, https_ctx* ctx) {

    u8 arenaBuffer[KiB(2)] = {0};
    struct aid_arena arena = (struct aid_arena){arenaBuffer, KiB(2), arenaBuffer};



    https_response response = {0};
    https_responseAddStatus(&response, 200, STR_LIT("OK"));
    https_responseAddHeader(&response, &STR_LIT("Content-Type: text/html"));
    FILE* f = fopen("../public/index.html", "r");
    https_responseAddBody(&response ,ctmpl_render(f, &arena, (ctmpl_params){0}));
    auto string = https_responseDeserialize(&response);
    i32 written = wolfSSL_write(ssl, string.s, string.length);

    free(string.s);
}

void sendNotFound(WOLFSSL* ssl, https_ctx* ctx) {
    u8 arenaBuffer[KiB(2)] = {0};
    struct aid_arena arena = (struct aid_arena){arenaBuffer, KiB(2), arenaBuffer};


    https_response response = {0};
    https_responseAddStatus(&response, 404, STR_LIT("Not Found"));
    https_responseAddHeader(&response, &STR_LIT("Content-Type: text/html"));
    FILE* f = fopen("../public/NotFound.html", "r");
    https_responseAddBody(&response ,ctmpl_render(f, &arena, (ctmpl_params){0}));
    auto string = https_responseDeserialize(&response);
    i32 written = wolfSSL_write(ssl, string.s, string.length);

    free(string.s);
}

void sendContentsOfDirectory(WOLFSSL* ssl, char* dirPath) {

}



void sendFileFromParams(WOLFSSL* ssl, https_ctx* ctx) {
    u8 arenaBuffer[KiB(5)] = {0};
    struct aid_arena arena = (struct aid_arena){arenaBuffer, sizeof(arenaBuffer), arenaBuffer};

    i32 i = 0;
    bool hasParams = false;
    for (; i < ctx->request->route.length; i++) {
        if (ctx->request->route.s[i] == '?') {
            hasParams = true;
            break;
        }
    }

    if (!hasParams) {
        sendNotFound(ssl, ctx);
        return;
    }

    struct aid_string filePath = {.options = AID_STR_AUTO_RESIZE};
    struct aid_string subString = {.options = AID_STR_AUTO_RESIZE};
    aid_str_append_string(&filePath, &STR_LIT("../public/"));
    aid_str_substring(&ctx->request->route, &subString, i+1, ctx->request->route.length);
    cleanPath(&subString);
    aid_str_append_string(&filePath, &subString);
    aid_str_append_char(&filePath, '\0');

    https_response response = {0};
    https_responseAddStatus(&response, 200, STR_LIT("OK"));
    https_responseAddHeader(&response, &STR_LIT("Content-Type: text/javascript"));
    if (is_directory(filePath.s)) {
        DIR *d;
        struct aid_string str = {.options = AID_STR_AUTO_RESIZE};
        struct dirent *dir;
        d = opendir(filePath.s); // Open current directory
        if (d) {
            while ((dir = readdir(d)) != NULL) {
                execv("ls", &filePath.s);
            }
            closedir(d);
        }
    }else {
        FILE* f = fopen(filePath.s, "r");
        if (!f) {
            sendNotFound(ssl, ctx);
            return;
        }
        const auto body = aid_str_read_file(&arena, f);
        https_responseAddBody(&response , *body);
        fclose(f);
    }
    const auto string = https_responseDeserialize(&response);
    i32 written = wolfSSL_write(ssl, string.s, string.length);
    free(string.s);
}

int main(int argc, char *argv[]) {

    https_certs certs = {.private_key = "../../localhost+2-key.pem", .cert_path = "../../localhost+2.pem"};
    https_reg_route(GET, STR_LIT("/"), callback);
    https_reg_route(GET, STR_LIT("/file"), sendFileFromParams);
    https_listen(3000, certs, 0);

    return 0;
}