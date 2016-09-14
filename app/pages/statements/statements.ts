import { Component, ViewChild } from '@angular/core';
import { InfiniteScroll, Content } from 'ionic-angular';
import { Store } from '@ngrx/store'
import 'rxjs/add/operator/skip';
import { REQUEST_CONTENT, RESET_CONTENT } from "../../reducers/content";

@Component({
  templateUrl: 'build/pages/statements/statements.html',
  providers: [InfiniteScroll],
})
export class StatementsPage {

  private statements$;
  private statementsCount$;

  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  @ViewChild(Content) content: Content;

  constructor(
    private store: Store<any>
  ) {

    this.statements$ = store.select(state => state.content.data);
    this.statementsCount$ = store.select(state => state.content.total);


    // on state.content.isFetching change to false => complete infinite spinner
    store.select(state => state.content.isFetching).skip(1).subscribe(isFetching => {
      if(!isFetching) {
        this.infiniteScroll.complete();
      }
    });
    // on state.content.nextOffset value change to -1 (no more items available) => disable infinite
    store.select(state => state.content.nextOffset).skip(1).subscribe(nextOffset => {
      if(nextOffset < 0) {
        this.infiniteScroll.enable(false);
      }
    });

    // on state.selectedClients value change, enable infinite
    store.select('selectedClients').skip(1).subscribe(selectedClients => {
      this.content.scrollToTop(0);
      this.infiniteScroll.enable(true);
    });

  }

  /**
   * set state change subscriptions
   */
  ionViewWillEnter() {
    // scroll to top and fetch contents
    this.content.scrollToTop(0);
    this.infiniteScroll.enable(true);
    this.store.dispatch({type: REQUEST_CONTENT});

  }

  /**
   * reset state.content to initial values
   */
  ionViewDidLeave() {
    this.store.dispatch({type: RESET_CONTENT});
  }

  /**
   * infinite scroll event - on scroll close to bottom => refetch content items
   * @param infiniteScroll
   */
  doInfinite(infiniteScroll) {
    this.store.dispatch({type: REQUEST_CONTENT});
  }

}
