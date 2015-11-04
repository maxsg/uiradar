/*
 * C_send_to_server.cpp
 *
 *  Created on: Ang 26, 2015
 *      Author: hongzi
 */

//include file in directory ~/UIradar/uiradar/host/include/uhd/usrp/uiradar/c_send_to_server2.hpp
//if you need to change the server address, go to the file above.
#include "c_send_to_server2.hpp"


// #include <cctype>
// #include <climits>
// #include <cstring>

//Added the LoadCertificates how in the server-side makes.    

int main()
{   
    std::string exp_name("100");

	unsigned int size = 2600;

    // boost::posix_time::ptime epoch(boost::gregorian::date(1970,1,1));
    boost::posix_time::ptime epoch = boost::posix_time::ptime(boost::gregorian::date(1970,1,1));

    

    ///////////////////////// This section needs to be added to any other file.
    Chunk temp_chunk;
    std::deque <Chunk > *ssl_deque;
    ssl_deque = new std::deque <Chunk >[1];
    pthread_t thread_t;
    //struct SSL_ARG_STRUCT ssl_td = {ssl_deque, SSL_comm};
    struct SSL_ARG_STRUCT ssl_td = {ssl_deque, SSL_COMM()};

    int rc;
    rc = pthread_create(&thread_t, NULL, Thread_Transfer_Data, &ssl_td);
    if (rc)
    {
        std::cout << "Error: unable to create USB thread," << rc << std::endl;
        exit(-1);
    }
    /////////////////////////

    std::complex<float> *dev0_data;
    std::complex<float> *dev1_data;
    dev0_data = new std::complex<float> [size];
    dev1_data = new std::complex<float> [size];
    float pos[3];

    float xmin=-5.0;
    float xmax=5.0;
    float ymin=0.0;
    float ymax=10.0;
    float zmin=0.0;
    float zmax=2.0;


    int x=0;
    int y=1;
    int z=2;

    int batch_size = 100;

    int run_duration = 5;
    time_t stop = time(0) + run_duration;
    time_t now = time(0);
    int i = 0;

    float stepsize = (xmax - xmin) / (static_cast <float> (batch_size));


    // while (now < stop) {
    //     fprintf(stderr, "sending batch %d\n", i);
    srand(time(NULL));

        float x_value = -5.0;

        for(unsigned int j = 0; j < batch_size; j++) {  
            usleep(75000);
            // usleep(10000);
            boost::posix_time::ptime t1 = boost::posix_time::microsec_clock::universal_time();

            // for(unsigned int i = 0; i < 3; i++){
            //     // temp_chunk.traj[i] = 1.0;
            //     temp_chunk.traj[i] = 23423.12;
            // }

            // temp_chunk.traj[x] = xmin + static_cast <float> (rand()) /( static_cast <float> (RAND_MAX/(xmax-xmin)));
            // temp_chunk.traj[y] = ymin + static_cast <float> (rand()) /( static_cast <float> (RAND_MAX/(ymax-ymin)));
            // temp_chunk.traj[z] = zmin + static_cast <float> (rand()) /( static_cast <float> (RAND_MAX/(zmax-zmin)));


            temp_chunk.traj[x] = x_value;
            temp_chunk.traj[y] = 5 + static_cast <float> (ymax/2.0 * cos(x_value));
            temp_chunk.traj[z] = zmin + static_cast <float> (rand()) /( static_cast <float> (RAND_MAX/(zmax-zmin)));
            
            x_value = x_value + stepsize;

            for(unsigned int i = 0; i < size; i ++)
            {
                dev0_data[i] = std::complex<float>(i+1.23, size - i);
                dev1_data[i] = std::complex<float>(i+1.23, size - i);

                temp_chunk.dev0_data[i] = dev0_data[i];
                temp_chunk.dev1_data[i] = dev1_data[i];
            }
            temp_chunk.num_dev = 100;
            std::string temp_name =  "user02";
            for(unsigned int i = 0; i<temp_name.length(); i++){
                temp_chunk.file_name[i] = temp_name[i];
            }
            temp_chunk.time = t1;


            // boost::posix_time::ptime mst1 = boost::posix_time::microsec_clock::local_time();
            // boost::this_thread::sleep(boost::posix_time::millisec(500));
            // boost::posix_time::ptime now = boost::posix_time::microsec_clock::local_time();
            // boost::posix_time::time_duration msdiff = epoch - now;
            // long timestamp = msdiff.total_milliseconds();

            // time_t seconds; 
            // time(&seconds); 
            // unsigned long long millis = (unsigned long long)seconds * 1000;

            // temp_chunk.timestamp = millis;

            // boost::posix_time::ptime t2 = boost::posix_time::microsec_clock::universal_time();
            // boost::posix_time::time_duration diff = t2 - epoch;
            // unsigned long long diff_time = diff.total_microseconds();
            // std::cout << j << " chunk timestamp " << t2 << std::endl;


            boost::posix_time::ptime ts = boost::posix_time::microsec_clock::universal_time();
            std::string ts_str = boost::posix_time::to_simple_string(ts);
            temp_chunk.timestamp = ts_str.c_str();


            // struct timeval tv;

            // gettimeofday(&tv, NULL);

            // unsigned long long millisecondsSinceEpoch =
            //     (unsigned long long)(tv.tv_sec) * 1000 +
            //     (unsigned long long)(tv.tv_usec) / 1000;

            // printf("%llu\n", millisecondsSinceEpoch);





            // auto epoch = std::chrono::system_clock::from_time_t(0);
            // auto now = std::chrono::high_resolution_clock::now();
            // auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now - epoch).count();
            // temp_chunk.timestamp = timestamp;
            // temp_chunk.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - std::chrono::system_clock::from_time_t(0)).count();

            ///////////////////////// This section needs to be added to any other file.
            pthread_mutex_lock(&mtx_ssl);
            ssl_td.ssl_deque[0].push_back(temp_chunk);
            pthread_cond_signal(&cond_ssl);
            pthread_mutex_unlock(&mtx_ssl);
            /////////////////////////

            boost::posix_time::ptime t2 = boost::posix_time::microsec_clock::universal_time();
            boost::posix_time::time_duration diff = t2 - t1;
            long diff_time = diff.total_microseconds();
            std::cout << j << " ssl duration " << t2 << std::endl;
        }

    //     now = time(0);
    //     usleep(2500000);    // half 1/4 sec
    //     i = i + 1;

    // }







    quit_now = true;

    usleep(1000000);

    delete [] dev0_data;
    delete [] dev1_data;
    delete [] ssl_deque;

    return 0;
}