/*
 * c_to_python_server.hpp
 *
 *  Created on: Jul 12, 2015
 *      Author: hongzi
 */

#include <stdio.h>
#include <stdlib.h>
#include <cstddef>
#include <string.h>
#include <iostream>
#include <errno.h>
#include <unistd.h>
#include <malloc/malloc.h>
#include <sys/socket.h>
#include <resolv.h>

#include <netdb.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <iterator>

// #include <boost/program_options.hpp>
#include <boost/format.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/thread.hpp>
#include <iostream>
#include <fstream>
#include <sstream>
#include <csignal>
#include <complex>
#include <vector>
#include <boost/filesystem/operations.hpp>

#include <cstdlib>
#include <pthread.h>
#include <queue>
#include <vector>
#include <boost/timer.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <cmath>

#include <boost/random.hpp>

#include </usr/local/include/libusb-1.0/libusb.h>

#include <chrono>
#include <time.h>



  


// #include </usr/include/libusb-1.0/libusb.h>

// #include <uhd/types/format.h>

#define FAIL -1
#define SUCCESS 1

void LoadCertificates(SSL_CTX* ctx, char* CertFile, char* KeyFile);
int OpenConnection(const char *hostname, int port);
SSL_CTX* InitCTX(void);
void ShowCerts(SSL* ssl);

class SSL_COMM
{
public:
    SSL_CTX *ctx;
    int server;
    SSL *ssl;
    int bytes;
    char *hostname;
    char *portnum;
    char *CertFile;
    char *KeyFile;

    SSL_COMM();
    ~SSL_COMM();

    void transfer_data(std::vector< std::complex<float> >& dev0_data, std::vector< std::complex<float> >& dev1_data, float *pos, unsigned int size, int num_dev, std::string exp_name);
    void transfer_data(std::complex<float>* dev0_data, std::complex<float>* dev1_data, float *pos, unsigned int size, int num_dev, std::string exp_name);
};

pthread_mutex_t mtx_ssl;
pthread_cond_t cond_ssl;

bool quit_now = false;

struct Chunk
{   
    std::complex<float> dev0_data[2600];
    std::complex<float> dev1_data[2600];
    float traj[3];  // x,y,z
    int num_dev;
    boost::posix_time::ptime time;
    char file_name[7];

    // int epoch; //= std::chronohigh_resolution_clock::from_time_t(0);
    // int now;  //= std::chronohigh_resolution_clock::now();
    // int timestamp; //= std::chrono::duration_cast<milliseconds>(now - epoch).count();
    // unsigned long long timestamp;
    const char* timestamp;
    // char[] timestamp;
};

struct SSL_ARG_STRUCT
{
    std::deque <Chunk > *ssl_deque;
    SSL_COMM ssl_comm;
};

// void *Thread_Transfer_Data(void *sslArgs);

SSL_COMM::SSL_COMM()
{
    //hostname ="18.111.73.31";
    // hostname ="localhost";
    hostname = "127.0.0.1";
    // hostname = "ec2-52-91-254-163.compute-1.amazonaws.com";
    // portnum ="8080";
    portnum = "8080";
    CertFile = "/Users/max/Codlings/radar_project/certificates/server.crt";
    KeyFile = "/Users/max/Codlings/radar_project/certificates/server.key";

    SSL_library_init();

    ctx = InitCTX();
    fprintf(stderr, "Initialized context\n");

    LoadCertificates(ctx, CertFile, KeyFile);
    fprintf(stderr, "Loaded certificates\n");

    server = OpenConnection(hostname, atoi(portnum));
    fprintf(stderr, "Opened connection\n");

    ssl = SSL_new(ctx);      /* create new SSL connection state */
    SSL_set_fd(ssl, server);    /* attach the socket descriptor */
    if (SSL_connect(ssl) == SUCCESS ) /* perform the connection */
    {   
        // std::string message = SSL_get_cipher(ssl);
        fprintf(stderr, "SSL Connection succeeded\n");
        ShowCerts(ssl);
    } else {
        fprintf(stderr, "SSL Connection failed\n");
        ERR_print_errors_fp(stderr);
        exit(1);
    }

}

SSL_COMM::~SSL_COMM()
{   
    SSL_free(ssl);        /* release connection state */
    close(server);         /* close socket */
    SSL_CTX_free(ctx);        /* release context */
}

void *Thread_Transfer_Data(void *sslArgs)
{
    fprintf(stderr, "Initializing data transfer...\n");
    struct SSL_ARG_STRUCT *ssl_args;
    ssl_args = (struct SSL_ARG_STRUCT *) sslArgs;
    Chunk SSL_Chunk;

    while(quit_now == false)
    {

        pthread_mutex_lock(&mtx_ssl);
        while((ssl_args->ssl_deque[0]).size() == 0){
            pthread_cond_wait(&cond_ssl, &mtx_ssl);
        }
        // std::cout << "before taking from front of queue" << std::endl;
        SSL_Chunk = (ssl_args->ssl_deque[0]).front();
        (ssl_args->ssl_deque[0]).pop_front();

        pthread_cond_signal(&cond_ssl);
        pthread_mutex_unlock(&mtx_ssl);

        // float traj[3];
        // float X = 100;
        // for (unsigned int i=0; i<3; i++) {
        //     traj[i] = static_cast <float> (rand()) / (static_cast <float> (RAND_MAX/X));
        //     // fprintf(stderr, "writing %f to traj\n", traj[i]);
        // }

        // int num_dev;
        // boost::posix_time::ptime time;
        // char file_name[7];

        fprintf(stderr, "trajectory data offset=%d and size=%d\n", offsetof(Chunk, traj), sizeof(SSL_Chunk.traj));
        fprintf(stderr, "num_dev offset=%d and size=%d\n", offsetof(Chunk, num_dev), sizeof(SSL_Chunk.num_dev));
        fprintf(stderr, "file_name offset=%d and size=%d\n", offsetof(Chunk, file_name), sizeof(SSL_Chunk.file_name));
        fprintf(stderr, "time offset=%d and size=%d\n", offsetof(Chunk, time), sizeof(SSL_Chunk.time));
        fprintf(stderr, "timestamp offset=%d and size=%d\n", offsetof(Chunk, timestamp), sizeof(SSL_Chunk.timestamp));
        fprintf(stderr, "Chunk size: %d\n", sizeof(Chunk));
        fprintf(stderr, "sending trajectory (%f, %f, %f)\n", SSL_Chunk.traj[0], SSL_Chunk.traj[1], SSL_Chunk.traj[2]);
        fprintf(stderr, "sending dev_id %d\n", SSL_Chunk.num_dev);
        // fprintf(stderr, "sending timestamp %llu\n", SSL_Chunk.timestamp);
        fprintf(stderr, "sending timestamp %s\n", SSL_Chunk.timestamp);
        fprintf(stderr, "\n");


        SSL_write(ssl_args->ssl_comm.ssl, &SSL_Chunk, sizeof(SSL_Chunk));
        // SSL_write(ssl_args->ssl_comm.ssl, &traj, sizeof(traj));        
    }
    std::cout << "Exit Thread_Transfer_Data" << std::endl;
    pthread_exit(NULL);
    return NULL;

}

void SSL_COMM::transfer_data(std::vector< std::complex<float> >& dev0_data, std::vector< std::complex<float> >& dev1_data, float *pos, unsigned int size, int num_dev, std::string exp_name)
{   
    Chunk SSL_Chunk;
    // SSL_Chunk.file_name = (intptr_t)exp_name;
    // std::cout << exp_name << "\t" << boost::lexical_cast<int>(exp_name) << std::endl;
    SSL_Chunk.num_dev = num_dev;
    for(unsigned int i = 0; i < 3; i++){
        SSL_Chunk.traj[i] = pos[i];
    }
    for(unsigned int i = 0; i < size; i++)
    {
        SSL_Chunk.dev0_data[i] = dev0_data[i];
        SSL_Chunk.dev1_data[i] = dev1_data[i];
    }
    // std::cout << sizeof(SSL_Chunk) << std::endl;
    // std::cout << "File name as int: " << SSL_Chunk.file_name << std::endl;

    SSL_write(ssl, &SSL_Chunk, sizeof(SSL_Chunk));

}

// void SSL_COMM::transfer_data(std::complex<float>* data, unsigned int size, int dev_id, char *exp_name)
void SSL_COMM::transfer_data(std::complex<float>* dev0_data, std::complex<float>* dev1_data, float *pos, unsigned int size, int num_dev, std::string exp_name)
{   

    Chunk SSL_Chunk;
    // SSL_Chunk.file_name = (intptr_t)exp_name;
    // std::cout << exp_name << "\t" << boost::lexical_cast<int>(exp_name) << std::endl;
    SSL_Chunk.num_dev = num_dev;
    for(unsigned int i = 0; i < 3; i++){
        SSL_Chunk.traj[i] = pos[i];
    }

    for(unsigned int i = 0; i < size; i++)
    {
        SSL_Chunk.dev0_data[i] = dev0_data[i];
        SSL_Chunk.dev1_data[i] = dev1_data[i];
    }
    // std::cout << sizeof(SSL_Chunk) << std::endl;
    // std::cout << "File name as int: " << SSL_Chunk.file_name << std::endl;

    SSL_write(ssl, &SSL_Chunk, sizeof(SSL_Chunk));

}

void LoadCertificates(SSL_CTX* ctx, char* CertFile, char* KeyFile)
{
 /* set the local certificate from CertFile */
    if ( SSL_CTX_use_certificate_file(ctx, CertFile, SSL_FILETYPE_PEM) <= 0 )
    {
        ERR_print_errors_fp(stderr);
        abort();
    }
    /* set the private key from KeyFile (may be the same as CertFile) */
    
    if ( SSL_CTX_use_PrivateKey_file(ctx, KeyFile, SSL_FILETYPE_PEM) <= 0 )
    {
        ERR_print_errors_fp(stderr);
        abort();
    }
    // verify private key
    if ( !SSL_CTX_check_private_key(ctx) )
    {
        fprintf(stderr, "Private key does not match the public certificate\n");
        abort();
    }
    
}

int OpenConnection(const char *hostname, int port)
{   int sd;
    struct hostent *host;
    struct sockaddr_in addr;

    if ( (host = gethostbyname(hostname)) == NULL )
    {
        fprintf(stderr, "cannot locate server\n");
        perror(hostname);
        abort();
    } else {
        fprintf(stderr, "located server\n");
    }
    sd = socket(PF_INET, SOCK_STREAM, 0);
    bzero(&addr, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = *(long*)(host->h_addr);
    if ( connect(sd, (struct sockaddr*)&addr, sizeof(addr)) != 0 )
    {
        fprintf(stderr, "failed to connect to server\n");
        close(sd);
        perror(hostname);
        abort();
    } else {
        fprintf(stderr, "connected to server\n");
    }
    return sd;
}

SSL_CTX* InitCTX(void)
{   
    SSL_METHOD *method;
    SSL_CTX *ctx;

    OpenSSL_add_all_algorithms();  /* Load cryptos, et.al. */
    SSL_load_error_strings();   /* Bring in and register error messages */
    method = SSLv23_client_method();  /* Create new client-method instance */
    ctx = SSL_CTX_new(method);   /* Create new context */
    if ( ctx == NULL )
    {
        ERR_print_errors_fp(stderr);
        abort();
    }
    return ctx;
}

void ShowCerts(SSL* ssl)
{   X509 *cert;
    char *line;

    cert = SSL_get_peer_certificate(ssl); /* get the server's certificate */
    if ( cert != NULL )
    {
        printf("Server certificates:\n");
        line = X509_NAME_oneline(X509_get_subject_name(cert), 0, 0);
        printf("Subject: %s\n", line);
        free(line);       /* free the malloc'ed string */
        line = X509_NAME_oneline(X509_get_issuer_name(cert), 0, 0);
        printf("Issuer: %s\n", line);
        free(line);       /* free the malloc'ed string */
        X509_free(cert);     /* free the malloc'ed certificate copy */
    }
    else
        printf("No certificates.\n");
}

float RandomFloat(float a, float b) {
    float random = ((float) rand()) / (float) RAND_MAX;
    float diff = b - a;
    float r = random * diff;
    return a + r;
}

float RandomFloatv2(float low, float hi) {
    srand(time(NULL));
    float r = low + static_cast <float> (rand()) /( static_cast <float> (RAND_MAX/(hi-low)));
    return r;
}

float gen_random_float(float min, float max)
{
    boost::mt19937 rng;
    boost::uniform_real<float> u(min, max);
    boost::variate_generator<boost::mt19937&, boost::uniform_real<float> > gen(rng, u);
    return gen();
}


